import { useContext, useEffect } from "preact/hooks";
import { apiFetch } from "../lib/api";
import { Signal, useComputed, useSignal } from "@preact/signals";
import { CommentWithUser, RawComment } from "../lib/models";
import { addNotification, AppState } from "../lib/appState";
import moment from "moment";
import { HttpStatus } from "../lib/enums";
import TrashIcon from "./icons/TrashIcon";
import FlagIcon from "./icons/FlagIcon";

interface CommentSectionProps {
    riceId: string;
    onLoad: () => void;
}

export default function CommentSection({
    riceId,
    onLoad,
}: CommentSectionProps) {
    const { accessToken } = useContext(AppState);

    const comments = useSignal<CommentWithUser[]>([]);

    useEffect(() => {
        apiFetch<CommentWithUser[]>("GET", `/rices/${riceId}/comments`)
            .then(([_, body]) => {
                comments.value = body;
                onLoad();
            })
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification(
                        "API",
                        `Failed to fetch comments: ${e.message}`,
                        "error"
                    );
                }
            });
    }, []);

    return (
        <div>
            {accessToken.value !== null && (
                <CommentCreator riceId={riceId} comments={comments} />
            )}
            <div className="flex flex-col gap-2">
                {comments.value.map((c) => (
                    <Comment key={c.commentId} {...c} comments={comments} />
                ))}
            </div>
        </div>
    );
}

function CommentCreator({
    riceId,
    comments,
}: {
    riceId: string;
    comments: Signal<CommentWithUser[]>;
}) {
    const { user } = useContext(AppState);

    const postComment = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;
        const formData = new FormData(target);

        try {
            const [status, comment] = await apiFetch<RawComment>(
                "POST",
                "/comments",
                JSON.stringify({
                    riceId,
                    content: formData.get("content") as string,
                })
            );

            if (status !== HttpStatus.Created) {
                throw new Error(
                    "Unexpected error occured when trying to post a comment. Please try again later."
                );
            }

            target.reset();
            comments.value = [
                {
                    commentId: comment.id,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                    displayName: user.value.displayName,
                    username: user.value.username,
                    avatar: user.value.avatarUrl,
                },
                ...comments.value,
            ];
        } catch (e) {
            if (e instanceof Error) {
                addNotification("Comment", e.message, "error");
            }
        }
    };

    return (
        <form onSubmit={postComment} className="mb-6 flex flex-col gap-2">
            <textarea
                className="bg-bright-background/50 border-gray/20 focus:border-gray/50 focus:bg-bright-background/80 resize-none rounded-lg border-2 p-4 text-lg transition-colors duration-500 outline-none"
                name="content"
                id="content"
                placeholder="Write a review"
                rows={4}
                required
            />
            <input
                className="bg-blue hover:bg-blue/70 hover:text-foreground/70 ml-auto cursor-pointer rounded-md px-8 py-2 text-lg font-bold transition-colors"
                type="submit"
                value="Post"
            />
        </form>
    );
}

function Comment({
    commentId,
    content,
    avatar,
    displayName,
    username,
    createdAt,
    comments,
}: CommentWithUser & { comments: Signal<CommentWithUser[]> }) {
    const { user, currentModal, report } = useContext(AppState);

    const isAuthor = useComputed(
        () => user.value !== null && user.value.username === username
    );

    const deleteComment = async () => {
        try {
            const [status, _] = await apiFetch(
                "DELETE",
                `/comments/${commentId}`
            );
            if (status !== HttpStatus.NoContent) {
                throw new Error(
                    "Something went wrong, please try again later."
                );
            }

            comments.value = comments.value.filter(
                (c) => c.commentId !== commentId
            );
        } catch (e) {
            if (e instanceof Error) {
                addNotification("Oh No!", e.message, "error");
            }
        }
    };

    const reportComment = () => {
        report.value = {
            resourceType: "comment",
            resourceId: commentId,
        };
        currentModal.value = "report";
    };

    return (
        <div
            className="bg-bright-background flex gap-4 rounded-lg p-2 md:p-4"
            id={commentId}
        >
            <div className="w-12 sm:w-16">
                <img className="rounded-md" src={avatar} alt="avatar" />
            </div>
            <div className="flex-1">
                <div className="-mt-1 flex items-center gap-1">
                    <a
                        className="hover:text-foreground/80 text-lg font-medium transition-colors hover:underline"
                        href={`/${username}`}
                    >
                        {displayName}
                    </a>
                    <p className="text-gray font-light">(@{username})</p>
                    <p className="ml-auto">{moment(createdAt).fromNow()}</p>
                </div>
                <div>
                    <p>{content}</p>
                </div>
            </div>
            <div className="border-gray/20 flex border-l-2 pl-4">
                {isAuthor.value ? (
                    <button
                        onClick={deleteComment}
                        className="bg-red/40 border-red/60 hover:bg-red/20 cursor-pointer rounded-md border p-2 transition-colors"
                    >
                        <TrashIcon />
                    </button>
                ) : (
                    <button
                        onClick={reportComment}
                        className="bg-dark-background-2/60 border-gray/30 hover:bg-gray/10 hover:text-red/70 cursor-pointer rounded-md border p-2 transition-colors"
                    >
                        <FlagIcon />
                    </button>
                )}
            </div>
        </div>
    );
}
