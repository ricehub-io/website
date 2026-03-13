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
    TrashIcon,
    XMarkIcon,
} from "@heroicons/react/24/solid";
import { FlagIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import { formatBytes } from "@/lib/math";
import { apiFetchV2, API_URL } from "@/api/apiFetch";
import CommentSection from "@/components/CommentSection";
import SectionTitle from "@/components/SectionTitle";
import { HttpStatus } from "@/lib/enums";
import { sanitizeMarkdownInput } from "@/lib/sanitize";
import ReactiveStarIcon from "@/components/icons/ReactiveStarIcon";
import { Rice, RiceDotfiles, RiceScreenshot } from "@/api/schemas";

export function RiceInfo({
    id,
    title,
    description,
    screenshots,
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
        reportCtx,
        modalCallback,
        okayModalCtx,
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
            const [status, _] = await apiFetchV2(
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
    const onDownload = () => {
        // only trusted people can be admins therefore
        // no reason to show this warning when downloading
        // rices posted by admin
        if (!author.isAdmin) {
        }

        okayModalCtx.value = {
            content: (
                <>
                    <h1 className="text-center text-2xl font-bold sm:text-3xl md:text-4xl">
                        Security Warning!
                    </h1>
                    <p>
                        The dotfiles you are about to download were uploaded by
                        other users. These files <b>may</b> contain malicious or
                        harmful content.
                    </p>
                    <p>
                        Before using any downloaded files, please take the time
                        to inspect them carefully. In particular:
                    </p>
                    <ul className="list-disc pl-4 font-medium">
                        <li className="mb-1">
                            Review all scripts (e.g. .sh, .bash, .zsh, .py,
                            etc.) to understand what commands they execute.
                        </li>
                        <li className="mb-1">
                            Do not run compiled executables or binaries included
                            in the download. Unlike scripts, their contents
                            cannot be easily inspected, and you cannot be
                            certain what they do.
                        </li>
                        <li>
                            Be cautious of files that automatically execute
                            commands, modify system settings, download
                            additional software, or request elevated privileges
                            (sudo).
                        </li>
                    </ul>
                    <p>
                        Always verify the contents before applying them to your
                        system.
                    </p>
                </>
            ),
        };
        modalCallback.value = () =>
            window.open(`${API_URL}/rices/${id}/dotfiles`);
        currentModal.value = "okay";
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
                <DownloadButton onDownload={onDownload} {...dotfiles} />
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
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
                {screenshots.map((scr) => (
                    <div
                        key={scr.id}
                        className="aspect-video cursor-pointer"
                        onClick={() => (zoom.value = scr.url)}
                    >
                        <img
                            className="border-background-2 h-full w-full rounded-md border-2 object-cover"
                            src={scr.url}
                            alt="preview"
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
                            alt="zoomed preview"
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
    onDownload,
}: { onDownload: () => void } & RiceDotfiles) {
    return (
        <div
            className="bg-bright-background hover:bg-bright-background hover:border-blue mt-4 flex items-center justify-between rounded-lg border-2 border-transparent px-4 py-3 transition-colors duration-300 select-none hover:cursor-pointer"
            onClick={onDownload}
        >
            <div className="flex items-center gap-2">
                <FolderArrowDownIcon className="size-6 sm:size-8 md:size-10" />
                <input
                    className="font-semibold hover:cursor-pointer sm:text-lg md:text-xl"
                    type="button"
                    value="Download"
                />
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
