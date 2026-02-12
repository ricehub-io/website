import { useSignal } from "@preact/signals";
import { PartialRice } from "../lib/models";
import { DownloadIcon } from "./icons/DownloadIcon";
import { StarIcon } from "./icons/StarIcon";
import { useLocation } from "preact-iso";
import { useContext, useEffect } from "preact/hooks";
import { apiFetch } from "../lib/api";
import { AppState } from "../lib/appState";
import PencilSquareIcon from "./icons/PencilSquareIcon";

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
    const { user } = useContext(AppState);

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
        // const res = await fetch(`${API_URL}/rices/${id}/star`, {
        //     method: isStarred.value ? "DELETE" : "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //         Authorization: `Bearer ${accessToken.value}`,
        //     },
        // });

        const [status, _] = await apiFetch("post", `/rices/${id}/star`);

        if (status === 201) {
            starCount.value += 1;
            isStarred.value = true;
        } else if (status === 204) {
            starCount.value -= 1;
            isStarred.value = false;
        }
    };

    const onEditClick = (e: Event) => {
        e.stopPropagation();
        route(`/edit-rice/${id}`);
    };

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
                <button
                    className="absolute right-4 top-4 bg-bright-background p-2 border cursor-pointer border-gray/40 rounded-lg transition-colors hover:bg-gray/20 hover:border-gray/60"
                    onClick={onEditClick}
                >
                    <PencilSquareIcon />
                </button>
            )}
        </div>
    );
}
