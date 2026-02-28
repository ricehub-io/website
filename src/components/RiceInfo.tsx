import { useComputed, useSignal } from "@preact/signals";
import { Dotfiles, Rice, RicePreview } from "../lib/models";
import { API_URL, apiFetch } from "../lib/api";
import { StarIcon } from "./icons/StarIcon";
import { DownloadIcon } from "./icons/DownloadIcon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import PencilIcon from "./icons/PencilIcon";
import { useLocation } from "preact-iso";
import { JSX } from "preact/jsx-runtime";
import TrashIcon from "./icons/TrashIcon";
import { useContext, useEffect, useRef } from "preact/hooks";
import { addNotification, AppState } from "../lib/appState";
import { ComponentChildren } from "preact";
import CommentSection from "./CommentSection";
import { HttpStatus } from "../lib/enums";
import XMarkIcon from "./icons/XMarkIcon";
import { sanitizeMarkdownInput } from "../lib/sanitize";
import FlagIcon from "./icons/FlagIcon";
import ExternalIcon from "./icons/ExternalIcon";
import SectionTitle from "./SectionTitle";
import { FolderArrowDownIcon, NoSymbolIcon } from "@heroicons/react/24/solid";

dayjs.extend(relativeTime);

export function RiceInfo({
    id,
    title,
    description,
    previews,
    stars,
    isStarred,
    downloads,
    dotfiles,
    author,
    createdAt,
    updatedAt,
}: Rice) {
    const { route } = useLocation();
    const {
        user,
        currentModal,
        currentRiceId,
        reportCtx: report,
    } = useContext(AppState);

    const isAuthor = useComputed(
        () => user.value !== null && user.value.id === author.id
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
            const [status, _] = await apiFetch(
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
        currentRiceId.value = id;
        currentModal.value = "deleteRice";
    };
    const onDownload = () => window.open(`${API_URL}/rices/${id}/dotfiles`);
    const openReportModal = () => {
        report.value = {
            resourceType: "rice",
            resourceId: id,
        };
        currentModal.value = "report";
    };

    return (
        <>
            <div className="flex flex-col items-center justify-between gap-y-4 md:flex-row">
                <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                    {title}
                </h1>
                <div className="flex flex-wrap justify-center gap-2 text-sm sm:text-base">
                    {!isAuthor.value && (
                        <HeaderButton
                            icon={<FlagIcon />}
                            content="Report"
                            onClick={openReportModal}
                        />
                    )}
                    <HeaderButton icon={<DownloadIcon />} content={downloads} />
                    <HeaderButton
                        className={`transition-colors duration-300 ${_isStarred.value && "text-accent"}`}
                        icon={<StarIcon solid={_isStarred.value} />}
                        content={starCount.value}
                        onClick={onStar}
                    />
                    {isAuthor.value && (
                        <>
                            <HeaderButton
                                icon={<PencilIcon />}
                                content="Edit"
                                onClick={onEdit}
                            />
                            <HeaderButton
                                icon={<TrashIcon />}
                                content="Delete"
                                onClick={onDelete}
                            />
                        </>
                    )}
                </div>
            </div>
            <div>
                <div
                    className="markdown-content bg-bright-background mb-2 rounded-lg p-6"
                    dangerouslySetInnerHTML={{
                        __html: sanitizeMarkdownInput(description),
                    }}
                />
                <div className="bg-bright-background flex items-center justify-between rounded-lg p-4 text-sm sm:text-base">
                    <div className="flex items-center gap-3">
                        <img
                            className="w-16 rounded-lg"
                            src={author.avatarUrl}
                            alt="Author's avatar"
                        />
                        <div>
                            <a
                                className={`flex items-center gap-0.5 text-base font-medium transition-colors hover:underline sm:text-lg md:text-xl ${author.isBanned ? "text-foreground/70" : "hover:text-foreground/80"}`}
                                href={`/${author.username}`}
                            >
                                {author.isBanned && (
                                    <NoSymbolIcon className="text-red/70 size-5 sm:size-6" />
                                )}
                                {author.displayName}
                            </a>
                            <p className="text-gray">@{author.username}</p>
                        </div>
                    </div>
                    <div className="text-right text-sm sm:text-base md:text-lg">
                        <p>
                            Created <b>{dayjs(createdAt).fromNow()}</b>
                        </p>
                        <p>
                            Updated <b>{dayjs(updatedAt).fromNow()}</b>
                        </p>
                    </div>
                </div>
            </div>
            <Separator />
            <div>
                <SectionTitle text="Screenshots" />
                <RiceScreenshots previews={previews} />
            </div>
            <RiceDotfiles onDownload={onDownload} {...dotfiles} />
            <Separator />
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

const Separator = () => <div className="bg-bright-background/50 mx-2 h-0.5" />;

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
            className={`${props.className} bg-bright-background flex items-center gap-1 rounded-lg px-3 py-1 ${onClick !== undefined ? "hover:bg-gray/30 transition-colors hover:cursor-pointer" : ""}`}
            onClick={onClick}
        >
            {icon}
            <p>{content}</p>
        </button>
    );
}

function RiceScreenshots({ previews }: { previews: RicePreview[] }) {
    const zoom = useSignal<string>(null); // holds preview URL if any image is zoomed
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
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {previews.map((preview) => (
                    <div
                        key={preview.id}
                        className="aspect-video cursor-pointer"
                        onClick={() => (zoom.value = preview.url)}
                    >
                        <img
                            className="border-background-2 h-full w-full rounded-md border-2 object-cover"
                            src={preview.url}
                            alt="preview"
                        />
                    </div>
                ))}
            </div>
            {zoom.value !== null && (
                <div className="bg-background/70 fixed top-0 left-0 flex h-full w-full items-center justify-center">
                    <div ref={imageRef} className="relative select-none">
                        <button
                            className="bg-red/40 border-red/60 hover:bg-red/20 absolute top-2 right-2 cursor-pointer rounded-md border p-1 transition-colors md:top-4 md:right-4 md:rounded-lg"
                            onClick={() => (zoom.value = null)}
                        >
                            <XMarkIcon className="!size-4 sm:!size-5 md:!size-6" />
                        </button>
                        <img
                            className="w-full"
                            src={zoom.value}
                            alt="zoomed preview"
                        />
                        <a
                            className="text-foreground/70 hover:text-foreground bg-dark-background/80 border-foreground/40 hover:bg-bright-background/80 absolute left-1/2 mt-2 flex -translate-x-1/2 items-center justify-center gap-1 rounded-md border px-2 py-1 text-sm whitespace-nowrap transition-colors sm:text-base md:text-lg"
                            href={zoom.value}
                            target="_blank"
                        >
                            <ExternalIcon className="!size-5 sm:!size-6 md:!size-7" />
                            Open image in new tab
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}

function RiceDotfiles({
    onDownload,
    updatedAt,
}: { onDownload: () => void } & Dotfiles) {
    return (
        <div
            className="bg-dark-background hover:bg-bright-background hover:border-accent flex items-center justify-between rounded-lg border-2 border-transparent px-4 py-3 transition-colors duration-300 select-none hover:cursor-pointer"
            onClick={onDownload}
        >
            <div className="flex items-center gap-2">
                <FolderArrowDownIcon className="size-8 sm:size-10" />
                <input
                    className="text-lg font-semibold hover:cursor-pointer sm:text-xl"
                    type="button"
                    value="Download"
                />
            </div>
            <div className="text-right text-sm sm:text-base md:text-lg">
                <p>
                    Size: <b>432.92 Kb</b>
                </p>
                <p>
                    Uploaded <b>{dayjs(updatedAt).fromNow()}</b>
                </p>
            </div>
        </div>
    );
}
