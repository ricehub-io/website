import { useSignal } from "@preact/signals";
import { PartialRice } from "../lib/models";
import { DownloadIcon } from "./icons/DownloadIcon";
import { StarIcon } from "./icons/StarIcon";
import { useLocation } from "preact-iso";
import { useContext, useEffect } from "preact/hooks";
import { apiFetch, FetchMethod } from "../lib/api";
import { AppState } from "../lib/appState";
import PencilSquareIcon from "./icons/PencilSquareIcon";
import { HttpStatus } from "../lib/enums";
import { JSX } from "preact/jsx-runtime";
import TrashIcon from "./icons/TrashIcon";

interface RicePreviewProps extends PartialRice {
    className?: string;
    hideActions?: boolean;
}

export default function RicePreview({
    className,
    hideActions,
    id,
    slug,
    username,
    thumbnail,
    title,
    displayName,
    downloads,
    ...props
}: RicePreviewProps) {
    const { route } = useLocation();
    const { user, currentModal, currentRiceId } = useContext(AppState);

    const starCount = useSignal(props.stars);
    const isStarred = useSignal(props.isStarred);

    useEffect(() => {
        isStarred.value = props.isStarred;
    }, [props.isStarred]);

    const onPreviewClick = () => route(`/${username}/${slug}`);

    const onStar = async (e: MouseEvent) => {
        e.stopPropagation();

        const method: FetchMethod = isStarred.value ? "DELETE" : "POST";
        const [status, _] = await apiFetch(method, `/rices/${id}/star`);

        if (status === HttpStatus.Created) {
            starCount.value += 1;
            isStarred.value = true;
        } else if (status === HttpStatus.NoContent) {
            starCount.value -= 1;
            isStarred.value = false;
        }
    };

    const onDelete = () => {
        currentRiceId.value = id;
        currentModal.value = "deleteRice";
    };

    const onEdit = () => route(`/edit-rice/${id}`);

    return (
        <div
            className={`bg-bright-background ease-in-out-quint hover:outline-accent relative rounded-md outline-offset-4 outline-transparent transition-colors duration-500 hover:cursor-pointer hover:outline-2 ${className}`}
            onClick={onPreviewClick}
        >
            <div className="box-content aspect-video overflow-hidden p-1">
                <img
                    className="h-full w-full rounded-sm object-cover"
                    src={thumbnail}
                    alt="thumbnail"
                />
            </div>
            <div className="flex items-center px-3 pb-2">
                <div>
                    <h1 className="-mb-1 text-lg">{title}</h1>
                    <p className="text-gray text-sm font-light">
                        by {displayName}
                    </p>
                </div>
                <div className="ml-auto flex gap-3 select-none">
                    <div className="flex items-center gap-1">
                        <DownloadIcon />
                        <p>{downloads}</p>
                    </div>
                    <div
                        onClick={onStar}
                        className="flex items-center gap-0.5 transition-colors duration-300 hover:cursor-pointer"
                    >
                        <StarIcon solid={isStarred.value} />
                        <p
                            className={`transition-colors duration-300 ${
                                isStarred.value && "text-accent"
                            }`}
                        >
                            {starCount}
                        </p>
                    </div>
                </div>
            </div>
            {!hideActions &&
                user.value !== null &&
                username === user.value.username && (
                    <div className="absolute top-4 right-4">
                        <FloatingButton
                            icon={<TrashIcon />}
                            onClick={onDelete}
                        />
                        <FloatingButton
                            icon={<PencilSquareIcon />}
                            onClick={onEdit}
                        />
                    </div>
                )}
        </div>
    );
}

function FloatingButton({
    icon,
    onClick: _onClick,
}: {
    icon: JSX.Element;
    onClick: () => void;
}) {
    const onClick = (e: Event) => {
        e.stopPropagation();
        _onClick();
    };

    return (
        <button
            className="bg-bright-background border-gray/40 hover:bg-gray/20 hover:border-gray/60 ml-2 cursor-pointer rounded-lg border p-2 transition-colors"
            onClick={onClick}
        >
            {icon}
        </button>
    );
}
