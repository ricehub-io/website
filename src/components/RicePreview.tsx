import { ApiError, FetchMethod, apiFetchV2 } from "@/api/apiFetch";
import { PartialRice } from "@/api/schemas";
import ReactiveStarIcon from "@/components/icons/ReactiveStarIcon";
import { addNotification, AppState } from "@/lib/appState";
import { HttpStatus } from "@/lib/enums";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/outline";
import {
    TrashIcon,
    PencilSquareIcon,
    ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { useSignal } from "@preact/signals";
import { useLocation } from "preact-iso";
import { useContext, useEffect } from "preact/hooks";
import { JSX } from "preact/jsx-runtime";

interface RicePreviewProps extends PartialRice {
    className?: string;
    hideActions?: boolean;
    onDelete?: () => void;
}

export default function RicePreview(props: RicePreviewProps) {
    const {
        className,
        hideActions,
        id,
        slug,
        username,
        thumbnail,
        title,
        displayName,
        comments,
        downloads,
        state,
        isFree,
    } = props;

    const { route } = useLocation();
    const { user, currentModal, currentRiceId, modalCallback } =
        useContext(AppState);

    const isWaiting = state === "waiting";

    const onPreviewClick = () => route(`/${username}/${slug}`);
    const onDelete = () => {
        modalCallback.value = props.onDelete;
        currentRiceId.value = id;
        currentModal.value = "deleteRice";
    };
    const onEdit = () => route(`/edit-rice/${id}`);

    return (
        // ugh i had to add a wrapper because pointer-events-none makes cursor-not-allowed not work -_-
        <div className={isWaiting ? "cursor-not-allowed" : "cursor-pointer"}>
            <div
                className={`bg-bright-background ease-in-out-quint hover:outline-blue relative h-full rounded-md outline-transparent transition-colors duration-500 select-none ${isWaiting ? "pointer-events-none" : "hover:outline-2"} ${className}`}
                onClick={onPreviewClick}
            >
                <p className="bg-dark-background border-background-2 absolute top-3 left-3 rounded-md border px-3 font-medium sm:text-lg">
                    {isFree ? "free" : "paid"}
                </p>
                <div
                    className={`box-content aspect-video overflow-hidden p-1 ${isWaiting ? "opacity-70" : ""}`}
                >
                    <img
                        className="h-full w-full rounded-sm object-cover"
                        src={thumbnail}
                        alt="thumbnail"
                    />
                </div>
                <div
                    className={`flex items-center px-3 pb-2 ${isWaiting ? "opacity-70" : ""}`}
                >
                    <div>
                        <h1 className="-mb-1 text-lg font-medium">{title}</h1>
                        <p className="text-gray text-sm md:text-base">
                            by {displayName}
                        </p>
                    </div>
                    <div className="ml-auto flex gap-2 select-none sm:gap-3 sm:text-lg">
                        <div className="flex items-center gap-1">
                            <ChatBubbleOvalLeftIcon className="size-4 sm:size-5" />
                            <p>{comments}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            <ArrowDownTrayIcon className="size-4 sm:size-5" />
                            <p>{downloads}</p>
                        </div>
                        <StarButton {...props} />
                    </div>
                </div>
                {!hideActions &&
                    user.value !== null &&
                    username === user.value.username && (
                        <div className="absolute top-2 right-2 md:top-3 md:right-3">
                            {isWaiting ? (
                                <p className="bg-dark-background/80 border-background-2 rounded-md border px-3 py-1 font-bold">
                                    PENDING
                                </p>
                            ) : (
                                <>
                                    <FloatingButton
                                        icon={
                                            <TrashIcon className="size-5 sm:size-6" />
                                        }
                                        onClick={onDelete}
                                    />
                                    <FloatingButton
                                        icon={
                                            <PencilSquareIcon className="size-5 sm:size-6" />
                                        }
                                        onClick={onEdit}
                                    />
                                </>
                            )}
                        </div>
                    )}
            </div>
        </div>
    );
}

function FloatingButton({
    icon,
    ...props
}: {
    icon: JSX.Element;
    onClick: () => void;
}) {
    const onClick = (e: Event) => {
        e.stopPropagation();
        props.onClick();
    };

    return (
        <button
            className="bg-bright-background/80 border-gray/40 hover:bg-gray/20 hover:border-gray/60 hover:text-foreground/80 ml-1.5 cursor-pointer rounded-lg border p-2 transition-colors"
            onClick={onClick}
        >
            {icon}
        </button>
    );
}

function StarButton({ id, ...props }: PartialRice) {
    const starCount = useSignal(props.stars);
    const isStarred = useSignal(props.isStarred);

    useEffect(() => {
        isStarred.value = props.isStarred;
    }, [props.isStarred]);

    const onStar = async (e: MouseEvent) => {
        e.stopPropagation();

        const method: FetchMethod = isStarred.value ? "DELETE" : "POST";

        try {
            const [status, _] = await apiFetchV2(method, `/rices/${id}/star`);

            if (status === HttpStatus.Created) {
                starCount.value += 1;
                isStarred.value = true;
            } else if (status === HttpStatus.NoContent) {
                starCount.value -= 1;
                isStarred.value = false;
            }
        } catch (e) {
            if (e instanceof ApiError) {
                if (e.statusCode === HttpStatus.Forbidden) {
                    addNotification(
                        "Forbidden",
                        "You must be logged in to do that",
                        "error"
                    );
                } else {
                    addNotification(
                        "Failed to star/unstar rice",
                        e.message,
                        "error"
                    );
                }
            }
        }
    };

    return (
        <div
            onClick={onStar}
            className="flex items-center gap-0.5 transition-colors duration-300 hover:cursor-pointer"
        >
            <ReactiveStarIcon
                solid={isStarred.value}
                className="size-4 sm:size-5"
            />
            <p
                className={`transition-colors duration-300 sm:text-lg ${
                    isStarred.value && "text-accent"
                }`}
            >
                {starCount}
            </p>
        </div>
    );
}
