import { useRoute } from "preact-iso";
import { useEffect } from "preact/hooks";
import { ApiError, apiFetch } from "../lib/api";
import { useSignal } from "@preact/signals";
import { PartialRice, User } from "../lib/models";
import { addNotification } from "../lib/appState";
import RicePreview from "../components/RicePreview";
import { HttpStatus } from "../lib/enums";
import NotFoundPage from "./_404";

export default function ProfilePage() {
    const route = useRoute();
    const { username } = route.params;

    const user = useSignal<User>(null);
    const userRices = useSignal<PartialRice[]>([]);
    const notFound = useSignal(false);

    useEffect(() => {
        apiFetch<User>("GET", `/users?username=${username}`)
            .then(([_, body]) => (user.value = body))
            .catch((e) => {
                if (e instanceof ApiError) {
                    if (e.statusCode === HttpStatus.NotFound) {
                        notFound.value = true;
                    } else {
                        addNotification(
                            "Failed to fetch user data",
                            e.message,
                            "error"
                        );
                    }
                }
            });
    }, [username]);

    useEffect(() => {
        if (user.value === null) {
            return;
        }

        apiFetch<PartialRice[]>("GET", `/users/${user.value.id}/rices`)
            .then(([_, body]) => (userRices.value = body))
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification(
                        "Failed to fetch user rices",
                        e.message,
                        "error"
                    );
                }
            });
    }, [user.value]);

    if (notFound.value) {
        return <NotFoundPage />;
    }

    // TODO: add skeleton placeholders when waiting for API responses
    return (
        user.value && (
            <div className="profile-page mx-auto flex flex-col gap-6">
                <UserInfo {...user.value} />
                <div className="bg-bright-background rounded-lg p-4">
                    <p className="mb-2 text-lg font-medium">
                        {user.value.displayName}'s Rices
                    </p>
                    <UserRices rices={userRices.value} />
                </div>
            </div>
        )
    );
}

function UserInfo({ avatarUrl, displayName, username, createdAt }: User) {
    const joinDate = new Date(createdAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="bg-bright-background rounded-lg p-4">
            <div className="flex gap-4">
                <div className="w-32">
                    <img
                        className="rounded-md"
                        src={avatarUrl}
                        alt="user's avatar"
                    />
                </div>
                <div className="flex flex-col">
                    <p className="text-4xl font-bold">{displayName}</p>
                    <p className="text-gray text-xl">@{username}</p>
                </div>
                <p className="ml-auto">Joined {joinDate}</p>
            </div>
        </div>
    );
}

function UserRices({ rices }: { rices: PartialRice[] }) {
    return (
        <div className="flex flex-wrap gap-4">
            {rices.length > 0 ? (
                rices.map((rice) => (
                    <RicePreview
                        key={rice.id}
                        {...rice}
                        className="!bg-background-2 max-w-64"
                        hideActions
                    />
                ))
            ) : (
                <p>This user hasn't created any rices yet :(</p>
            )}
        </div>
    );
}
