import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { addNotification } from "@/lib/appState";
import { For } from "@preact/signals/utils";
import { apiFetch } from "@/api/apiFetch";
import { CommentWithUser } from "@/api/legacy-schemas";
import { formatLocaleDate } from "@/lib/math";

interface CommentListProps {
    commentLimit: number;
}

export default function CommentList({ commentLimit }: CommentListProps) {
    const comments = useSignal<CommentWithUser[]>([]);

    useEffect(() => {
        console.log("fetch comments");
        apiFetch<CommentWithUser[]>("GET", `/comments?limit=${commentLimit}`)
            .then(([_, body]) => (comments.value = body))
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification(
                        "Failed to fetch recent comments",
                        e.message,
                        "error"
                    );
                }
            });
    }, []);

    return (
        <For
            each={comments}
            fallback={
                <p className="my-6 text-center text-xl font-medium">
                    No recently posted comments
                </p>
            }
        >
            {(comment, _) => <Comment key={comment.commentId} {...comment} />}
        </For>
    );
}

function Comment({
    avatar,
    displayName,
    username,
    content,
    createdAt,
}: CommentWithUser) {
    return (
        <div className="bg-background-2 flex gap-4 rounded-md p-4">
            <div className="w-16">
                <img className="rounded-md" src={avatar} alt="avatar" />
            </div>
            <div className="flex-1">
                <div className="-mt-1 flex items-center gap-1">
                    <p className="text-lg font-medium">{displayName}</p>
                    <p className="text-gray">(@{username})</p>
                    <p className="ml-auto">{formatLocaleDate(createdAt)}</p>
                </div>
                <div>
                    <p>{content}</p>
                </div>
            </div>
        </div>
    );
}
