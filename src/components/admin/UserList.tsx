import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { addNotification } from "@/lib/appState";
import { For } from "@preact/signals/utils";
import { apiFetch } from "@/api/apiFetch";
import { formatLocaleDate } from "@/lib/math";
import { User, UserSchema } from "@/api/schemas";

interface UserListProps {
    userLimit: number;
}

export default function UserList({ userLimit }: UserListProps) {
    const users = useSignal<User[]>([]);

    useEffect(() => {
        apiFetch("GET", `/users?limit=${userLimit}`, null, UserSchema.array())
            .then(([_, body]) => (users.value = body))
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification(
                        "Failed to fetch recent users",
                        e.message,
                        "error"
                    );
                }
            });
    }, []);

    return (
        // same as in rice list, we can assume that at least one user exists
        <For each={users}>
            {(user, _) => <UserInfo key={user.id} {...user} />}
        </For>
    );
}

function UserInfo({
    avatarUrl,
    displayName,
    username,
    createdAt,
    updatedAt,
}: User) {
    return (
        <div className="bg-background-2 rounded-md p-4 text-sm sm:text-left sm:text-base">
            <div className="flex flex-col items-center gap-2 sm:gap-4 md:flex-row">
                <div className="flex items-center gap-2">
                    <img
                        className="aspect-square w-12 rounded-md sm:w-16"
                        src={avatarUrl}
                        alt="user's avatar"
                    />
                    <div>
                        <a
                            href={`/${username}`}
                            target="_blank"
                            className="text-base font-medium sm:text-lg"
                        >
                            {displayName}
                        </a>
                        <p className="text-gray -mt-1">@{username}</p>
                    </div>
                </div>
                <div className="sm:ml-auto">
                    <p>
                        Created{" "}
                        <span className="font-medium">
                            {formatLocaleDate(createdAt)}
                        </span>
                    </p>
                    <p>
                        Updated{" "}
                        <span className="font-medium">
                            {formatLocaleDate(updatedAt)}
                        </span>
                    </p>
                </div>
            </div>
            <div></div>
        </div>
    );
}
