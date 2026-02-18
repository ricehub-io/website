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

export default function RicePreview({
    id,
    slug,
    username,
    thumbnail,
    title,
    displayName,
    downloads,
    ...props
}: PartialRice) {
    const { route } = useLocation();
    const { user, currentModal, currentRiceId } = useContext(AppState);

    const starCount = useSignal(props.stars);
    const isStarred = useSignal(props.isStarred);

    useEffect(() => {
        isStarred.value = props.isStarred;
    }, [props.isStarred]);

    const onPreviewClick = () => {
        route(`/${username}/${slug}`);
    };

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
            key={slug}
            className="relative bg-bright-background rounded-md transition-colors duration-1000 ease-in-out-quint outline-transparent outline-offset-4 hover:cursor-pointer hover:outline-accent hover:outline-2"
            onClick={onPreviewClick}
        >
            <div className="aspect-video overflow-hidden box-content p-1">
                <img
                    className="w-full h-full object-cover rounded-sm"
                    src={thumbnail}
                    alt="thumbnail"
                />
            </div>
            <div className="flex items-center px-3 pb-2">
                <div>
                    <h1 className="text-lg -mb-1">{title}</h1>
                    <p className="text-sm font-light text-gray">
                        by {displayName}
                    </p>
                </div>
                <div className="flex gap-3 ml-auto select-none">
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
            {user.value !== null && username === user.value.username && (
                <div className="absolute right-4 top-4">
                    <FloatingButton icon={<TrashIcon />} onClick={onDelete} />
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
            className="bg-bright-background p-2 border cursor-pointer border-gray/40 rounded-lg transition-colors hover:bg-gray/20 hover:border-gray/60 ml-2"
            onClick={onClick}
        >
            {icon}
        </button>
    );
}
