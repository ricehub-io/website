import { useSignal } from "@preact/signals";
import { Dotfiles, Rice } from "../lib/models";
import { API_URL } from "../lib/consts";
import { StarIcon } from "./icons/StarIcon";
import { DownloadIcon } from "./icons/DownloadIcon";
import { FolderArrowIcon } from "./icons/FolderArrowIcon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function RiceInfo({
    id,
    title,
    description,
    previews,
    stars,
    downloads,
    dotfiles,
    createdAt,
    updatedAt,
}: Rice) {
    const isStarred = useSignal(false);

    const onStar = () => {
        isStarred.value = !isStarred.value;
    };

    const onDownload = () => {
        window.open(`${API_URL}/rices/${id}/dotfiles`);
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold">{title}</h1>
                <div className="flex gap-2">
                    <div
                        className="flex items-center gap-1 bg-bright-background px-2 py-1 rounded-lg hover:cursor-pointer"
                        onClick={onStar}
                    >
                        <StarIcon solid={isStarred.value} />
                        <p className={`transition-colors duration-300 ${isStarred.value && "text-accent"}`}>
                            {stars}
                        </p>
                    </div>
                    <div className="flex items-center gap-1 bg-bright-background px-2 py-1 rounded-lg">
                        <DownloadIcon />
                        <p>{downloads}</p>
                    </div>
                </div>
            </div>
            <p className="whitespace-pre-line">{description}</p>
            <div>
                <p>
                    Created <b>{dayjs(createdAt).fromNow()}</b>
                </p>
                <p>
                    Last updated <b>{dayjs(updatedAt).fromNow()}</b>
                </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
                {previews.map((url, index) => (
                    <div className="aspect-video">
                        <img className="w-full h-full object-cover" key={index} src={url} alt="preview" />
                    </div>
                ))}
            </div>
            <RiceDotfiles onDownload={onDownload} {...dotfiles} />
        </>
    );
}

function RiceDotfiles({ onDownload, updatedAt }: { onDownload: () => void } & Dotfiles) {
    return (
        <div
            className="flex items-center justify-between bg-dark-background px-4 py-3 rounded-lg border-2 border-transparent transition-colors duration-300 select-none hover:bg-bright-background hover:cursor-pointer hover:border-accent"
            onClick={onDownload}
        >
            <div className="flex items-center gap-2">
                <FolderArrowIcon />
                <input
                    className="text-xl font-semibold hover:cursor-pointer"
                    type="button"
                    value="Download"
                />
            </div>
            <div className="text-right">
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
