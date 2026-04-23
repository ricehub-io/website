import { useRoute } from "preact-iso";
import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import moment from "moment";
import { NoSymbolIcon } from "@heroicons/react/24/solid";
import { apiFetch, ApiError } from "@/api/apiFetch";
import { PartialRice, Profile, ProfileSchema, User } from "@/api/schemas";
import RicePreview from "@/components/RicePreview";
import { addNotification } from "@/lib/appState";
import { HttpStatus } from "@/lib/enums";
import NotFoundPage from "@/pages/_404";

export default function ProfilePage() {
    const route = useRoute();
    const { username } = route.params;

    const profile = useSignal<Profile>(null);
    const notFound = useSignal(false);

    useEffect(() => {
        apiFetch("GET", `/profiles/${username}`, null, ProfileSchema)
            .then(([, body]) => (profile.value = body))
            .catch((e) => {
                if (e instanceof ApiError) {
                    if (e.statusCode === HttpStatus.NotFound) {
                        notFound.value = true;
                    } else {
                        addNotification("¡Ay, caramba!", e.message, "error");
                    }
                }
            });
    }, [username]);

    if (notFound.value) {
        return <NotFoundPage />;
    }

    // TODO: add skeleton placeholders when waiting for API responses
    return (
        profile.value !== null && (
            <div className="profile-page mx-auto flex flex-col gap-6">
                {profile.value.user.isBanned && (
                    <p className="bg-red/50 border-red -mb-4 rounded-lg border px-3 py-2 font-bold sm:px-6 sm:py-4 sm:text-lg">
                        This account has been banned for violating terms of
                        service.
                    </p>
                )}
                <UserInfo {...profile.value.user} />
                <div className="bg-bright-background rounded-lg p-4">
                    <p className="mb-2 text-lg font-medium">
                        {profile.value.user.displayName}'s Rices
                    </p>
                    <UserRices rices={profile.value.rices} />
                </div>
            </div>
        )
    );
}

function UserInfo({
    avatarUrl,
    displayName,
    username,
    isBanned,
    createdAt,
}: User) {
    return (
        <div className="bg-bright-background rounded-lg p-4">
            <div className="flex gap-4">
                <img
                    className={`aspect-square w-22 rounded-md sm:w-28 md:w-32 ${isBanned ? "opacity-70" : ""}`}
                    src={avatarUrl}
                    alt="user's avatar"
                />
                <div className="flex flex-1 flex-col md:flex-row md:justify-between">
                    <div className="flex flex-col">
                        <p
                            className={`flex items-center gap-0.5 text-lg font-bold sm:text-2xl md:text-3xl lg:text-4xl ${(isBanned && "text-foreground/70") || ""}`}
                        >
                            {isBanned && (
                                <NoSymbolIcon className="text-red/70 size-5 sm:size-6 md:size-7 lg:size-8" />
                            )}
                            {displayName}
                        </p>
                        <p className="text-gray text-base sm:text-lg md:text-xl">
                            @{username}
                        </p>
                    </div>
                    <p className="mt-auto text-sm sm:text-base md:mt-0 md:text-lg">
                        Joined{" "}
                        <span className="font-medium">
                            {moment(createdAt).format("MMMM Do, YYYY")}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

function UserRices({ rices }: { rices: PartialRice[] }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rices.length > 0 ? (
                rices.map((rice) => (
                    <RicePreview
                        key={rice.id}
                        {...rice}
                        className="!bg-background-2"
                        hideActions
                    />
                ))
            ) : (
                <p>This user hasn't created any rices yet :(</p>
            )}
        </div>
    );
}
