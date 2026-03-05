import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import { addNotification } from "@/lib/appState";
import { For } from "@preact/signals/utils";
import { apiFetchV2 } from "@/api/apiFetch";
import { formatLocaleDate } from "@/lib/math";
import moment from "moment";
import { CommentWithUser, CommentWithUserSchema } from "@/api/schemas";

interface CommentListProps {
    commentLimit: number;
}

export default function CommentList({ commentLimit }: CommentListProps) {
    const comments = useSignal<CommentWithUser[]>([]);

    useEffect(() => {
        console.log("fetch comments");
        apiFetchV2(
            "GET",
            `/comments?limit=${commentLimit}`,
            null,
            CommentWithUserSchema.array()
        )
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
                <p className="my-6 text-center font-medium sm:text-xl">
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
        <div className="bg-background-2 flex gap-2 rounded-md p-4 sm:gap-4">
            <div className="w-12 sm:w-16">
                <img className="rounded-md" src={avatar} alt="avatar" />
            </div>
            <div className="flex-1">
                <div className="-mt-1 flex items-center gap-1">
                    <p className="text-base font-medium sm:text-lg">
                        {displayName}
                    </p>
                    <p className="text-gray hidden sm:block">(@{username})</p>
                    <p className="ml-auto hidden sm:block">
                        {formatLocaleDate(createdAt)}
                    </p>
                    <p className="text-gray ml-auto sm:hidden">
                        {moment(createdAt).fromNow()}
                    </p>
                </div>
                <div className="text-sm sm:text-base">
                    <p>{content}</p>
                </div>
            </div>
        </div>
    );
}
