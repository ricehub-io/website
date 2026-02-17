import { useSignal } from "@preact/signals";
import { Dotfiles, Rice } from "../lib/models";
import { API_URL } from "../lib/api";
import { StarIcon } from "./icons/StarIcon";
import { DownloadIcon } from "./icons/DownloadIcon";
import { FolderArrowIcon } from "./icons/FolderArrowIcon";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import PencilIcon from "./icons/PencilIcon";
import { useLocation } from "preact-iso";
import { JSX } from "preact/jsx-runtime";
import TrashIcon from "./icons/TrashIcon";
import { useContext } from "preact/hooks";
import { AppState } from "../lib/appState";
import { ComponentChildren } from "preact";
import CommentSection from "./CommentSection";

dayjs.extend(relativeTime);

export function RiceInfo({
    id,
    title,
    description,
    previews,
    stars,
    downloads,
    dotfiles,
    author,
    createdAt,
    updatedAt,
}: Rice) {
    const { route } = useLocation();
    const { user, currentModal, currentRiceId } = useContext(AppState);

    const isStarred = useSignal(false);

    const onStar = () => (isStarred.value = !isStarred.value);
    const onEdit = () => route(`/edit-rice/${id}`);
    const onDelete = () => {
        currentRiceId.value = id;
        currentModal.value = "deleteRice";
    };
    const onDownload = () => window.open(`${API_URL}/rices/${id}/dotfiles`);

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold">{title}</h1>
                <div className="flex gap-2">
                    <div className="flex items-center gap-1 bg-bright-background px-2 py-1 rounded-lg">
                        <DownloadIcon />
                        <p>{downloads}</p>
                    </div>
                    <HeaderButton
                        className={`transition-colors duration-300 ${isStarred.value && "text-accent"}`}
                        icon={<StarIcon solid={isStarred.value} />}
                        content={stars}
                        onClick={onStar}
                    />
                    {user.value !== null && author.id === user.value.id && (
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
                <p className="whitespace-pre-line bg-bright-background p-4 rounded-lg mb-2">
                    {description}
                </p>
                <div className="flex items-center justify-between bg-bright-background p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <img
                            className="w-16 rounded-lg"
                            src={author.avatarUrl}
                            alt="Author's avatar"
                        />
                        <div>
                            <p className="text-xl font-medium">
                                {author.displayName}
                            </p>
                            <p className="text-gray">@{author.username}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p>
                            Created <b>{dayjs(createdAt).fromNow()}</b>
                        </p>
                        <p>
                            Last updated <b>{dayjs(updatedAt).fromNow()}</b>
                        </p>
                    </div>
                </div>
            </div>
            <Separator />
            <div>
                <SectionTitle title="Screenshots" />
                <div className="grid grid-cols-2 gap-2">
                    {previews.map((preview) => (
                        <div className="aspect-video">
                            <img
                                className="w-full h-full object-cover"
                                key={preview.id}
                                src={preview.url}
                                alt="preview"
                            />
                        </div>
                    ))}
                </div>
            </div>
            <RiceDotfiles onDownload={onDownload} {...dotfiles} />
            <Separator />
            <div>
                <SectionTitle title="Comments" />
                <CommentSection riceId={id} />
            </div>
        </>
    );
}

const Separator = () => <div className="h-0.5 bg-bright-background/50 mx-2" />;

function SectionTitle({ title }: { title: string }) {
    return <h3 className="text-2xl font-bold mb-2">{title}</h3>;
}

function RiceDotfiles({
    onDownload,
    updatedAt,
}: { onDownload: () => void } & Dotfiles) {
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

function HeaderButton({
    onClick,
    content,
    icon,
    ...props
}: {
    onClick: () => void;
    content: ComponentChildren;
    icon: JSX.Element;
    className?: string;
}) {
    return (
        <button
            className={`${props.className} flex items-center gap-1 bg-bright-background px-2 py-1 rounded-lg transition-colors hover:cursor-pointer hover:bg-gray/30`}
            onClick={onClick}
        >
            {icon}
            <p>{content}</p>
        </button>
    );
}
