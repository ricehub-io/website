import { useSignal } from "@preact/signals";
import { formatLocaleDate } from "../../lib/math";
import { CommentWithUser } from "../../lib/models";
import { useEffect } from "preact/hooks";
import { apiFetch } from "../../lib/api";
import { addNotification } from "@/lib/appState";

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

    return comments.value.map((comment) => (
        <Comment key={comment.commentId} {...comment} />
    ));
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
