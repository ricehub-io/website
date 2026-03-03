import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { addNotification } from "@/lib/appState";
import { For } from "@preact/signals/utils";
import { apiFetch } from "@/api/apiFetch";
import { User } from "@/api/legacy-schemas";
import { formatLocaleDate } from "@/lib/math";

interface UserListProps {
    userLimit: number;
}

export default function UserList({ userLimit }: UserListProps) {
    const users = useSignal<User[]>([]);

    useEffect(() => {
        console.log("fetch users");

        apiFetch<User[]>("GET", `/users?limit=${userLimit}`)
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
        <div className="bg-background-2 rounded-md p-4">
            <div className="flex items-center gap-4">
                <div className="w-16">
                    <img
                        className="rounded-md"
                        src={avatarUrl}
                        alt="user's avatar"
                    />
                </div>
                <div>
                    <a
                        href={`/${username}`}
                        target="_blank"
                        className="text-lg font-medium"
                    >
                        {displayName}
                    </a>
                    <p className="text-gray">@{username}</p>
                </div>
                <div className="ml-auto">
                    <p>Created {formatLocaleDate(createdAt)}</p>
                    <p>Updated {formatLocaleDate(updatedAt)}</p>
                </div>
            </div>
            <div></div>
        </div>
    );
}
