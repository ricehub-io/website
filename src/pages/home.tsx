import { useContext, useEffect } from "preact/hooks";
import { PartialRice } from "../lib/models";
import { useComputed, useSignal } from "@preact/signals";
import RicePreview from "../components/RicePreview";
import { apiFetch } from "../lib/api";
import { Placeholder } from "../components/Placeholder";
import { addNotification, AppState } from "../lib/appState";
import { RadioButton, RadioButtonProps } from "../components/RadioButton";
import { TargetedEvent } from "preact/compat";

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

    const sortBy = useSignal<SortOption>("trending");
    const rices = useSignal<PartialRice[]>([]);
    const isLoaded = useComputed(() => rices.value.length > 0);

    const fetchRices = () => {
        apiFetch<PartialRice[]>("GET", `/rices?sort=${sortBy.value}`)
            .then(([_, body]) => (rices.value = body))
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification("Something went wrong", e.message, "error");
                }
            });
    };

    useEffect(fetchRices, [accessToken.value, sortBy.value]);

    const changeSorting = (e: TargetedEvent<HTMLInputElement>) => {
        sortBy.value = e.currentTarget.value as SortOption;
    };

    useEffect(() => {
        addNotification("Test", "Lorem ipsum dolor sit amet", "info");
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <p className="text-lg font-medium">
                    {isLoaded.value
                        ? `Showing ${rices.value.length} results`
                        : "Fetching rices from API..."}
                </p>
                <div className="flex">
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
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {isLoaded.value ? (
                    rices.value.map((rice) => (
                        <RicePreview key={rice.id} {...rice} />
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
        </div>
    );
}
