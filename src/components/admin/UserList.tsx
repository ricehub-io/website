import { useEffect } from "preact/hooks";
import { formatLocaleDate } from "../../lib/math";
import { User } from "../../lib/models";
import { useSignal } from "@preact/signals";
import { apiFetch } from "../../lib/api";
import { addNotification } from "@/lib/appState";

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

    return users.value.map((user) => <UserInfo key={user.id} {...user} />);
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
                    <p className="text-lg font-medium">{displayName}</p>
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
