import { useContext, useEffect } from "preact/hooks";
import { Signal, useComputed, useSignal } from "@preact/signals";
import moment from "moment";
import { For, Show } from "@preact/signals/utils";
import { InputHTMLAttributes } from "preact/compat";
import { addNotification, AppState } from "@/lib/appState";
import { apiFetch } from "@/api/apiFetch";
import Bullet from "@/components/Bullet";
import { HttpStatus } from "@/lib/enums";
import { TrashIcon, NoSymbolIcon } from "@heroicons/react/24/solid";
import { FlagIcon } from "@heroicons/react/24/outline";
import {
    CommentSchema,
    CommentWithUser,
    CommentWithUserSchema,
} from "@/api/schemas";

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
        apiFetch(
            "GET",
            `/rices/${riceId}/comments`,
            null,
            CommentWithUserSchema.array()
        )
            .then(([, body]) => {
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
                <For
                    each={comments}
                    fallback={
                        <p className="text-gray mt-1 text-base sm:text-lg">
                            No comments found :(
                        </p>
                    }
                >
                    {(c) => (
                        <Comment key={c.commentId} comments={comments} {...c} />
                    )}
                </For>
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
            const [status, comment] = await apiFetch(
                "POST",
                "/comments",
                JSON.stringify({
                    riceId,
                    content: formData.get("content") as string,
                }),
                CommentSchema
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
                    isBanned: user.value.isBanned,
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
        <form
            onSubmit={postComment}
            className="mb-6 flex flex-col gap-2 text-sm sm:text-base md:text-lg"
        >
            <textarea
                className="bg-bright-background/50 border-gray/20 focus:border-gray/50 focus:bg-bright-background/80 resize-none rounded-lg border-2 p-4 transition-colors duration-500 outline-none"
                name="content"
                id="content"
                placeholder="Write a review"
                rows={4}
                required
            />
            <input
                className="bg-blue hover:bg-blue/70 hover:text-foreground/70 ml-auto cursor-pointer rounded-md px-8 py-2 font-bold transition-colors"
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
    isBanned,
    displayName,
    username,
    createdAt,
    comments,
}: CommentWithUser & { comments: Signal<CommentWithUser[]> }) {
    const { user, currentModal, reportCtx: report } = useContext(AppState);

    const canDelete = useComputed(
        () =>
            user.value !== null &&
            (user.value.username === username || user.value.isAdmin)
    );

    const deleteComment = async () => {
        try {
            const [status] = await apiFetch("DELETE", `/comments/${commentId}`);
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
            className="bg-bright-background relative flex gap-2 rounded-lg p-3 sm:gap-3 md:p-4"
            id={commentId}
        >
            <img
                className="aspect-square w-12 rounded-md sm:w-16"
                src={avatar}
                alt="avatar"
            />
            <div className="flex-1 text-sm sm:text-base md:text-lg">
                <div className="-mt-1 flex items-center gap-1">
                    <a
                        className={`flex items-center gap-0.5 text-base font-medium transition-colors hover:underline sm:text-lg md:text-xl ${isBanned ? "text-foreground/70" : "hover:text-foreground/80"}`}
                        href={`/${username}`}
                    >
                        {isBanned && (
                            <NoSymbolIcon className="text-red/70 size-4 sm:size-5" />
                        )}
                        {displayName}
                    </a>
                    <p className="text-gray hidden sm:block">(@{username})</p>
                    <p className="text-gray ml-auto">
                        {moment(createdAt).fromNow()}
                    </p>
                    {/* action buttons for small screens */}
                    <div className="sm:hidden">
                        <Bullet className="text-foreground/20 mr-1" />
                        <Show
                            when={canDelete}
                            fallback={
                                <TextButton
                                    value="Report"
                                    onClick={reportComment}
                                />
                            }
                        >
                            <TextButton
                                value="Delete"
                                onClick={deleteComment}
                            />
                        </Show>
                    </div>
                </div>
                <p className="text-foreground/80">{content}</p>
            </div>
            {/* action buttons for bigger screens */}
            <div className="border-gray/20 hidden border-l-2 pl-4 sm:flex">
                {canDelete.value ? (
                    <button
                        onClick={deleteComment}
                        className="bg-red/40 border-red/60 hover:bg-red/20 cursor-pointer rounded-md border p-2 transition-colors"
                    >
                        <TrashIcon className="size-8" />
                    </button>
                ) : (
                    <button
                        onClick={reportComment}
                        className="bg-dark-background-2/60 border-gray/30 hover:bg-gray/10 hover:text-red/70 cursor-pointer rounded-md border p-2 transition-colors"
                    >
                        <FlagIcon className="size-8" />
                    </button>
                )}
            </div>
        </div>
    );
}

const TextButton = (props: InputHTMLAttributes) => {
    return (
        <input
            className="text-gray hover:text-bright-gray cursor-pointer transition-colors"
            type="button"
            {...props}
        />
    );
};
