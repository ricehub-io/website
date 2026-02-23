import { useContext, useEffect } from "preact/hooks";
import { AppState } from "../lib/appState";
import { useLocation } from "preact-iso";
import moment from "moment";
import { useSignal } from "@preact/signals";
import { PartialRice } from "../lib/models";
import RicePreview from "../components/RicePreview";
import { apiFetch } from "../lib/api";
import { HttpStatus } from "../lib/enums";

export default function AccountPage() {
    const { route } = useLocation();
    const { currentModal, user, userLoading } = useContext(AppState);

    const rices = useSignal<PartialRice[]>([]);

    // useEffect(() => {
    //     if (user.value === null && !userLoading.value) {
    //         route("/", true);
    //     }
    // }, [userLoading.value]);

    useEffect(() => {
        if (user.value === null) {
            return;
        }

        const _ohmy = async () => {
            const [status, body] = await apiFetch<PartialRice[]>(
                "GET",
                `/users/${user.value.id}/rices`
            );
            if (status === HttpStatus.Ok) {
                rices.value = body;
            }
        };
        _ohmy();
    }, [user.value]);

    return (
        user.value && (
            <div className="mx-12 py-4">
                <div className="mb-6 flex gap-4">
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
                                className="w-48 rounded-lg"
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
                <RiceList rices={rices.value} />
            </div>
        )
    );
}

function SectionTitle(props: { text: string }) {
    return <h1 className="mb-2 text-3xl font-bold">{props.text}</h1>;
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
            className={`block ${props.red ? "bg-red" : "bg-blue"} mb-4 cursor-pointer rounded-md px-8 py-3 text-lg font-bold transition-colors ${props.red ? "hover:bg-red/70" : "hover:bg-blue/70"}`}
            type="button"
            value={props.label}
        />
    );
}

function RiceList({ rices }: { rices: PartialRice[] }) {
    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rices.map((rice) => (
                <RicePreview {...rice} />
            ))}
        </div>
    );
}
