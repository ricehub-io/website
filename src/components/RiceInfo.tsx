import { useComputed, useSignal } from "@preact/signals";
import { useLocation } from "preact-iso";
import { JSX } from "preact/jsx-runtime";
import { useContext, useEffect, useRef } from "preact/hooks";
import { addNotification, AppState } from "@/lib/appState";
import { ComponentChildren } from "preact";
import {
    ArrowDownTrayIcon,
    ArrowTopRightOnSquareIcon,
    FolderArrowDownIcon,
    NoSymbolIcon,
    PencilIcon,
    ShoppingCartIcon,
    TrashIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid";
import { FlagIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import { formatBytes } from "@/lib/math";
import { apiFetch, API_URL } from "@/api/apiFetch";
import CommentSection from "@/components/CommentSection";
import SectionTitle from "@/components/SectionTitle";
import { HttpStatus } from "@/lib/enums";
import { sanitizeMarkdownInput } from "@/lib/sanitize";
import ReactiveStarIcon from "@/components/icons/ReactiveStarIcon";
import {
    PurchaseRiceSchema,
    Rice,
    RiceDotfiles,
    RiceScreenshot,
} from "@/api/schemas";
import Bullet from "@/components/Bullet";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";

export function RiceInfo({
    id,
    title,
    description,
    screenshots,
    stars,
    isStarred,
    isOwned,
    downloads,
    dotfiles,
    tags,
    author,
    createdAt,
    updatedAt,
}: Rice) {
    const { route } = useLocation();
    const { user, currentModal, currentRiceId, reportCtx, modalCallback } =
        useContext(AppState);

    const _isOwned = useSignal(isOwned);
    const isAuthor = useComputed(
        () => user.value !== null && user.value.id === author.id
    );
    const toPurchase = useComputed(
        () => !isAuthor.value && dotfiles.type !== "free" && !_isOwned.value
    );

    const _isStarred = useSignal(isStarred);
    const starCount = useSignal(stars);

    const commentsLoaded = useSignal(false);

    useEffect(() => {
        _isStarred.value = isStarred;
    }, [isStarred]);

    // scroll to anchor if provided
    const scrolledRef = useRef(false);
    useEffect(() => {
        if (
            !document ||
            !location.hash ||
            scrolledRef.current ||
            !commentsLoaded.value
        ) {
            return;
        }

        const id = location.hash.replace("#", "");
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
            scrolledRef.current = true;
        }
    }, [location, scrolledRef, commentsLoaded.value]);

    const onStar = async () => {
        try {
            const [status] = await apiFetch(
                _isStarred.value ? "DELETE" : "POST",
                `/rices/${id}/star`
            );
            _isStarred.value = !_isStarred.value;
            starCount.value += status === HttpStatus.Created ? 1 : -1;
        } catch (e) {
            if (e instanceof Error) {
                addNotification(
                    "Whoops!",
                    `Unexpected error occured when sending request to API: ${e.message}`,
                    "error"
                );
            }
        }
    };
    const onEdit = () => route(`/edit-rice/${id}`);
    const onDelete = () => {
        modalCallback.value = () => route("/", true);
        currentRiceId.value = id;
        currentModal.value = "deleteRice";
    };

    /** onDownloadClick callback is triggered when user either presses download or purchase button */
    const onDownloadClick = () => {
        if (toPurchase.value) {
            apiFetch("POST", `/rices/${id}/purchase`, null, PurchaseRiceSchema)
                .then(([, body]) =>
                    openCheckout(
                        body.checkoutUrl,
                        () => (_isOwned.value = true)
                    )
                )
                .catch((e) => {
                    if (e instanceof Error) {
                        addNotification(
                            "Something went wrong",
                            `Failed to fetch checkout session: ${e.message}`,
                            "error"
                        );
                    }
                });
            return;
        }

        window.open(`${API_URL}/rices/${id}/dotfiles`);
    };
    const openReportModal = () => {
        reportCtx.value = {
            resourceType: "rice",
            resourceId: id,
        };
        currentModal.value = "report";
    };

    const openAuthorProfile = () => route(`/${author.username}`);

    return (
        <>
            {/* rice header */}
            <div className="flex flex-col items-center justify-between gap-y-4 md:flex-row">
                <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                    {title}
                </h1>
                <div className="flex flex-wrap justify-center gap-2 text-sm sm:text-base">
                    {!isAuthor.value && (
                        <HeaderButton
                            icon={<FlagIcon className="size-6" />}
                            content="Report"
                            onClick={openReportModal}
                        />
                    )}
                    <HeaderButton
                        icon={<ArrowDownTrayIcon className="size-6" />}
                        content={downloads}
                    />
                    <HeaderButton
                        className={`transition-colors duration-300 ${_isStarred.value && "text-accent"}`}
                        icon={<ReactiveStarIcon solid={_isStarred.value} />}
                        content={starCount.value}
                        onClick={onStar}
                    />
                    {isAuthor.value && (
                        <>
                            <HeaderButton
                                icon={<PencilIcon className="size-6" />}
                                content="Edit"
                                onClick={onEdit}
                            />
                            <HeaderButton
                                icon={<TrashIcon className="size-6" />}
                                content="Delete"
                                onClick={onDelete}
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="flex gap-1">
                {tags.map(({ id, name }) => (
                    <p
                        key={id}
                        className="bg-dark-background border-blue text-foreground/90 rounded-sm border px-4 py-0.5 text-sm font-semibold"
                    >
                        {name}
                    </p>
                ))}
            </div>

            <div className="bg-dark-background rounded-lg p-6">
                {/* author + creation date */}
                <div className="flex items-center gap-2">
                    <img
                        className="aspect-square w-10 rounded-lg md:w-12"
                        src={author.avatarUrl}
                        alt="avatar"
                    />
                    <div
                        className={`-mt-1 cursor-pointer transition-opacity select-none ${author.isBanned ? "opacity-70 hover:opacity-50" : "hover:opacity-80"}`}
                        onClick={openAuthorProfile}
                    >
                        <div className="flex items-center">
                            {author.isBanned && (
                                <NoSymbolIcon className="text-red/70 size-4 md:size-5" />
                            )}
                            <p className="text-base font-bold md:text-lg">
                                {author.displayName}
                            </p>
                        </div>
                        <p className="text-gray -mt-1 text-sm md:text-base">
                            @{author.username}
                        </p>
                    </div>
                    <div className="-mt-1 ml-auto text-sm md:text-base">
                        <p>
                            Created <b>{moment(createdAt).fromNow()}</b>
                        </p>
                        <p>
                            Updated <b>{moment(updatedAt).fromNow()}</b>
                        </p>
                    </div>
                </div>

                <Separator />

                {/* screenshots */}
                <div>
                    <SectionTitle text="Screenshots" />
                    <RiceScreenshots screenshots={screenshots} />
                </div>

                {/* description */}
                <div className="mt-4">
                    <SectionTitle text="Description" />
                    <div
                        className="markdown-content bg-bright-background rounded-lg p-6"
                        dangerouslySetInnerHTML={{
                            __html: sanitizeMarkdownInput(description),
                        }}
                    />
                </div>

                {/* dotfiles */}
                <DownloadButton
                    showPurchase={toPurchase.value}
                    onClick={onDownloadClick}
                    {...dotfiles}
                />
            </div>

            <Separator />

            {/* comment section */}
            <div>
                <SectionTitle text="Comments" />
                <CommentSection
                    riceId={id}
                    onLoad={() => (commentsLoaded.value = true)}
                />
            </div>
        </>
    );
}

const Separator = () => <div className="bg-bright-background/50 my-4 h-0.5" />;

function HeaderButton({
    onClick,
    content,
    icon,
    ...props
}: {
    onClick?: () => void;
    content: ComponentChildren;
    icon: JSX.Element;
    className?: string;
}) {
    return (
        <button
            className={`${props.className} bg-bright-background flex items-center gap-1 rounded-lg px-3 py-1 sm:text-lg ${onClick !== undefined ? "hover:bg-gray/30 transition-colors hover:cursor-pointer" : ""}`}
            onClick={onClick}
        >
            {icon}
            <p>{content}</p>
        </button>
    );
}

function RiceScreenshots({ screenshots }: { screenshots: RiceScreenshot[] }) {
    const zoom = useSignal<string>(null); // holds screenshot URL if any image is zoomed
    const imageRef = useRef<HTMLDivElement>(); // reference to container holding the zoomed image

    // disable page scrolling when zoomed
    useEffect(() => {
        document.body.style.overflow =
            zoom.value !== null ? "hidden" : "visible";
    }, [zoom.value]);

    const mouseClicked = (e: MouseEvent) => {
        if (!imageRef.current || imageRef.current.contains(e.target as Node)) {
            return;
        }
        // clicked outside the image
        zoom.value = null;
    };

    const keyPressed = ({ key }: KeyboardEvent) => {
        if (zoom.value === null) {
            return;
        }

        if (key === "Escape") {
            zoom.value = null;
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", mouseClicked);

        return () => {
            document.removeEventListener("mousedown", mouseClicked);
        };
    }, []);

    // TODO: automatically remove listener if zoom is null
    useEffect(() => {
        document.addEventListener("keydown", keyPressed);

        return () => {
            document.removeEventListener("keydown", keyPressed);
        };
    }, []);

    return (
        <>
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {screenshots.map((scr, idx) => (
                    <div
                        key={idx}
                        className="aspect-video cursor-pointer"
                        onClick={() => (zoom.value = scr.url)}
                    >
                        <img
                            className="border-background-2 h-full w-full rounded-md border-2 object-cover"
                            src={scr.url}
                            alt="screenshot"
                        />
                    </div>
                ))}
            </div>
            {zoom.value !== null && (
                <div className="bg-background/70 fixed top-0 left-0 z-50 flex aspect-video h-full w-full items-center justify-center">
                    <div
                        ref={imageRef}
                        className="relative aspect-video w-full max-w-3/4 select-none lg:h-3/5 lg:w-auto xl:h-3/4"
                    >
                        <button
                            className="bg-red/40 border-red/60 hover:bg-red/20 absolute top-2 right-2 cursor-pointer rounded-md border p-1 transition-colors md:top-4 md:right-4 md:rounded-lg"
                            onClick={() => (zoom.value = null)}
                        >
                            <XMarkIcon className="size-4 sm:size-5 md:size-6" />
                        </button>
                        <img
                            className="w-full"
                            src={zoom.value}
                            alt="zoomed screenshot"
                        />
                        <a
                            className="text-foreground/70 hover:text-foreground bg-dark-background/80 border-foreground/40 hover:bg-bright-background/80 absolute left-1/2 mt-2 flex -translate-x-1/2 items-center justify-center gap-1 rounded-md border px-2 py-1 text-sm whitespace-nowrap transition-colors sm:text-base md:text-lg"
                            href={zoom.value}
                            target="_blank"
                        >
                            <ArrowTopRightOnSquareIcon className="size-5 sm:size-6 md:size-7" />
                            Open image in new tab
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}

function DownloadButton({
    updatedAt,
    fileSize,
    price,
    showPurchase,
    onClick,
}: { showPurchase: boolean; onClick: () => void } & RiceDotfiles) {
    return (
        <div
            className="bg-bright-background hover:bg-bright-background hover:border-blue mt-4 flex items-center justify-between rounded-lg border-2 border-transparent px-4 py-3 transition-colors duration-300 select-none hover:cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-center gap-2 font-semibold sm:text-lg md:text-xl">
                {!showPurchase ? (
                    <>
                        <FolderArrowDownIcon className="size-6 sm:size-8 md:size-10" />
                        <p>Download</p>
                    </>
                ) : (
                    <>
                        <ShoppingCartIcon className="size-6 sm:size-8 md:size-10" />
                        <p>Purchase</p>
                        <Bullet />
                        <p className="font-jetbrains-mono">
                            ${price.toFixed(2)}
                        </p>
                    </>
                )}
            </div>
            <div className="text-right text-sm sm:text-base md:text-lg">
                <p>
                    Size: <b>{formatBytes(fileSize)}</b>
                </p>
                <p>
                    Uploaded <b>{moment(updatedAt).fromNow()}</b>
                </p>
            </div>
        </div>
    );
}

const openCheckout = async (url: string, onSuccess: () => void) => {
    try {
        const checkout = await PolarEmbedCheckout.create(url, {
            theme: "dark",
        });

        checkout.addEventListener("success", () => {
            onSuccess();
        });
    } catch (e) {
        if (e instanceof Error) {
            addNotification("Failed to open checkout", e.message, "error");
        }
    }
};
