import { useContext, useEffect } from "preact/hooks";
import { useComputed, useSignal } from "@preact/signals";
import { TargetedEvent } from "preact/compat";
import {
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronUpIcon,
} from "@heroicons/react/24/solid";
import { clamp } from "@/lib/math";
import { RadioButton, RadioButtonProps } from "@/components/RadioButton";
import { ApiError, apiFetchV2 } from "@/api/apiFetch";
import { Placeholder } from "@/components/Placeholder";
import RicePreview from "@/components/RicePreview";
import { AppState, addNotification } from "@/lib/appState";
import { FetchRicesSchema, PartialRice } from "@/api/schemas";
import { HttpStatus } from "@/lib/enums";

const SORT_OPTIONS = [
    "recent",
    "trending",
    "mostStars",
    "mostDownloads",
] as const;
const SORT_BUTTONS: RadioButtonProps[] = [
    {
        text: "Trending",
        value: "trending",
        defaultChecked: true,
    },
    {
        text: "Recent",
        value: "recent",
    },
    {
        text: "Most Stars",
        value: "mostStars",
    },
    {
        text: "Most Downloads",
        value: "mostDownloads",
    },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number];

export default function HomePage() {
    const { accessToken } = useContext(AppState);

    const pageCount = useSignal(1);
    const currentPage = useSignal(1);

    const sortBy = useSignal<SortOption>("trending");
    const rices = useSignal<PartialRice[]>([]);
    const isLoaded = useComputed(() => rices.value.length > 0);

    const fetchRices = () => {
        apiFetchV2("GET", `/rices?sort=${sortBy.value}`, null, FetchRicesSchema)
            .then(([_, data]) => {
                rices.value = data.rices;
                pageCount.value = data.pageCount;
            })
            .catch((e) => {
                if (e instanceof ApiError) {
                    addNotification(
                        "Failed to fetch rices",
                        e.message,
                        "error"
                    );
                } else if (e instanceof Error) {
                    addNotification(
                        "Unexpected error occured",
                        e.message.slice(0, 512),
                        "error"
                    );
                }
                console.error(e);
            });
    };

    useEffect(() => {
        currentPage.value = 1;
        fetchRices();
    }, [accessToken.value, sortBy.value]);

    const changeSorting = (
        e: TargetedEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        sortBy.value = e.currentTarget.value as SortOption;
    };

    const changePage = async (newPage: number) => {
        // right now its not possible to open any page number we want
        // we have to go page by page to get last rice data for pagination
        // I could just make a loop that fetches api X amount of times and
        // fetches paginated rices until gets to selected page number
        // but that would be easy to abuse
        const diff = newPage - currentPage.value;
        if (diff > 1) {
            newPage = currentPage.value + 1;
        } else if (diff < -1) {
            newPage = currentPage.value -= 1;
        }

        if (newPage === 1) {
            fetchRices();
            currentPage.value = 1;
            return;
        }

        // access last rice in rices to get values for pagination
        const reverse = diff < 0;
        const rice = rices.value.at(reverse ? 0 : -1);
        if (rice === undefined) {
            addNotification(
                "Something went wrong",
                "Tried fetching paginated rices but rice is undefined. Check console logs for more details.",
                "error"
            );
            console.log(rices.value);
            return;
        }

        // fetch paginated rices
        try {
            const sort = sortBy.value;
            let endpoint = `/rices?sort=${sort}&lastId=${rice.id}`;

            if (reverse) {
                endpoint += "&reverse=true";
            }

            switch (sort) {
                case "trending":
                    endpoint += `&lastScore=${rice.score}`;
                    break;
                case "recent":
                    endpoint += `&lastCreatedAt=${encodeURIComponent(rice.createdAt)}`;
                    break;
                case "mostDownloads":
                    endpoint += `&lastDownloads=${rice.downloads}`;
                    break;
                case "mostStars":
                    endpoint += `&lastStars=${rice.stars}`;
                    break;
                default:
                    const exhaustiveCheck: never = sort;
                    throw new Error(
                        `Unhandled paginated sorting case: ${exhaustiveCheck}`
                    );
            }

            const [status, data] = await apiFetchV2(
                "GET",
                endpoint,
                null,
                FetchRicesSchema
            );
            if (status !== HttpStatus.Ok) {
                throw new Error(
                    `Unexpected status code received from API: ${status}`
                );
            }

            rices.value = data.rices;
        } catch (e) {
            if (e instanceof Error) {
                addNotification(
                    "Failed to fetch paginated rices",
                    e.message,
                    "error"
                );
                return;
            }
        }

        // and finally update the current page number
        currentPage.value = newPage;
    };

    const incrementPage = (byNegative: boolean) => {
        const newValue = (currentPage.value += byNegative ? -1 : 1);
        currentPage.value = clamp(newValue, 1, pageCount.value);
        changePage(currentPage.value);
    };

    const deleteRice = (riceId: string) => {
        rices.value = rices.value.filter((rice) => rice.id !== riceId);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <p className="text-lg font-medium">
                    {isLoaded.value
                        ? `Showing ${rices.value.length} results`
                        : "Fetching rices from API..."}
                </p>
                {/* sorting buttons for bigger screens */}
                <div className="hidden md:flex">
                    {SORT_BUTTONS.map((props) => (
                        <RadioButton
                            key={props.value}
                            {...props}
                            className="px-4 py-2"
                            name="sortOption"
                            onChange={changeSorting}
                        />
                    ))}
                </div>
                {/* sorting selection for small screens only */}
                <div className="relative md:hidden">
                    <select
                        className="peer bg-gray/20 border-gray/60 cursor-pointer appearance-none rounded-md border py-2 pr-8 pl-4 outline-none"
                        name="sortOption"
                        id="sortOption"
                        onChange={changeSorting}
                    >
                        {SORT_BUTTONS.map(({ value, text }) => (
                            <option
                                value={value}
                                selected={value === sortBy.value}
                            >
                                {text}
                            </option>
                        ))}
                    </select>
                    <ChevronDownIcon className="text-gray/80 absolute top-1/2 right-2.5 size-4 -translate-y-1/2 peer-focus:hidden" />
                    <ChevronUpIcon className="text-gray/80 absolute top-1/2 right-2.5 hidden size-4 -translate-y-1/2 peer-focus:block" />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoaded.value ? (
                    rices.value.map((rice) => (
                        <RicePreview
                            key={rice.id}
                            {...rice}
                            onDelete={() => deleteRice(rice.id)}
                        />
                    ))
                ) : (
                    <>
                        <Placeholder className="aspect-video" />
                        <Placeholder className="aspect-video" />
                        <Placeholder className="aspect-video" />
                        <Placeholder className="aspect-video" />
                    </>
                )}
            </div>
            {/* pagination buttons */}
            {pageCount.value > 1 && (
                <div className="font-jetbrains-mono text-foreground/40 mx-auto flex items-center gap-4 text-lg select-none">
                    <ChevronLeftIcon
                        className="size-6 cursor-pointer"
                        onClick={() => incrementPage(true)}
                    />
                    {Array(pageCount.value)
                        .fill(0)
                        .map((_, pageNum) => (
                            <PageButton
                                onClick={changePage}
                                index={pageNum + 1}
                                isActive={currentPage.value === pageNum + 1}
                            />
                        ))}
                    <ChevronRightIcon
                        className="size-6 cursor-pointer"
                        onClick={() => incrementPage(false)}
                    />
                </div>
            )}
        </div>
    );
}

const PageButton = ({
    index,
    isActive,
    onClick: onClickCb,
}: {
    index: number;
    isActive?: boolean;
    onClick: (number) => void;
}) => {
    const onClick = () => {
        if (isActive) {
            return;
        }

        onClickCb(index);
    };

    return (
        <input
            className={`cursor-pointer ${isActive ? "text-blue font-bold" : ""}`}
            type="button"
            value={index}
            onClick={onClick}
        />
    );
};
