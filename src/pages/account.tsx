import { useContext, useEffect } from "preact/hooks";
import moment from "moment";
import { Signal, useSignal } from "@preact/signals";
import { apiFetchV2 } from "@/api/apiFetch";
import { PartialRice, PartialRiceSchema } from "@/api/schemas";
import RicePreview from "@/components/RicePreview";
import SectionTitle from "@/components/SectionTitle";
import { AppState, addNotification } from "@/lib/appState";

export default function AccountPage() {
    const { currentModal, user } = useContext(AppState);

    const rices = useSignal<PartialRice[]>([]);

    useEffect(() => {
        apiFetchV2(
            "GET",
            `/users/${user.value.id}/rices`,
            null,
            PartialRiceSchema.array()
        )
            .then(([_, body]) => (rices.value = body))
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification(
                        "Failed to fetch user rices",
                        e.message,
                        "warning"
                    );
                }
            });
    }, []);

    return (
        <div className="mx-auto w-full py-4 md:w-[min(80%,1400px)]">
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                    <SectionTitle text="Details" />
                    <div className="bg-bright-background rounded-lg p-8">
                        <UserDetail
                            label="Display name"
                            value={user.value.displayName}
                        />

                        <UserDetail
                            label="Username"
                            value={user.value.username}
                        />

                        <UserDetail
                            label="Created"
                            value={moment(user.value.createdAt).fromNow()}
                        />

                        <UserDetailLabel label="Avatar" />
                        <img
                            className="w-32 rounded-lg sm:w-36 md:w-48"
                            src={user.value.avatarUrl}
                            alt="user's avatar"
                        />
                    </div>
                </div>
                <div className="flex flex-1 flex-col">
                    <SectionTitle text="Actions" />
                    <div className="bg-bright-background h-full rounded-lg p-8">
                        <Button
                            label="Change display name"
                            onClick={() =>
                                (currentModal.value = "changeDisplayName")
                            }
                        />
                        <Button
                            label="Change password"
                            onClick={() =>
                                (currentModal.value = "changePassword")
                            }
                        />
                        <Button
                            label="Change avatar"
                            onClick={() =>
                                (currentModal.value = "changeAvatar")
                            }
                        />
                        <Button
                            label="Delete avatar"
                            onClick={() =>
                                (currentModal.value = "deleteAvatar")
                            }
                        />
                        <Button
                            label="Delete account"
                            red
                            onClick={() =>
                                (currentModal.value = "deleteAccount")
                            }
                        />
                    </div>
                </div>
            </div>
            <SectionTitle text="Rices" />
            <RiceList rices={rices} />
        </div>
    );
}

function UserDetailLabel({ label }: { label: string }) {
    return <p className="text-gray text-lg">{label}</p>;
}

function UserDetail(props: { label: string; value: string }) {
    return (
        <div className="mb-2">
            <UserDetailLabel label={props.label} />
            <p className="text-xl">{props.value}</p>
        </div>
    );
}

function Button(props: { label: string; red?: boolean; onClick?: () => {} }) {
    return (
        <input
            onClick={props.onClick}
            className={`block ${props.red ? "bg-red" : "bg-blue"} mb-4 w-full cursor-pointer rounded-md px-4 py-3 text-lg font-bold transition-colors sm:px-8 md:w-64 ${props.red ? "hover:bg-red/70" : "hover:bg-blue/70"}`}
            type="button"
            value={props.label}
        />
    );
}

function RiceList({ rices }: { rices: Signal<PartialRice[]> }) {
    const deleteRice = (riceId: string) => {
        rices.value = rices.value.filter((rice) => rice.id !== riceId);
    };

    return (
        <div className="bg-bright-background grid grid-cols-1 gap-4 rounded-lg p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rices.value.length > 0 ? (
                rices.value.map((rice) => (
                    <RicePreview
                        key={rice.id}
                        {...rice}
                        className="!bg-background-2"
                        onDelete={() => deleteRice(rice.id)}
                    />
                ))
            ) : (
                <p className="text-lg font-medium">
                    You don't have any rices :(
                </p>
            )}
        </div>
    );
}
