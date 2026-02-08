import { useContext, useEffect } from "preact/hooks";
import { AppState } from "../lib/appState";
import { useLocation } from "preact-iso";
import moment from "moment";

export function AccountPage() {
    const { route } = useLocation();
    const { currentModal, user, userLoading } = useContext(AppState);

    useEffect(() => {
        if (user.value === null && !userLoading.value) {
            route("/", true);
        }
    }, [userLoading]);

    return (
        user.value !== null && (
            <div className="flex gap-4 mx-12 py-4">
                <div className="flex-1">
                    <SectionTitle text="Details" />
                    <div className="bg-bright-background p-8 rounded-lg">
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
                            className="w-48"
                            src={user.value.avatarUrl}
                            alt="user's avatar"
                        />
                    </div>
                </div>
                <div className="flex-1 flex flex-col">
                    <SectionTitle text="Actions" />
                    <div className="bg-bright-background p-8 rounded-lg h-full">
                        <Button
                            label="Change display name"
                            onClick={() =>
                                (currentModal.value = "changeDisplayName")
                            }
                        />
                        <Button label="Change password" />
                        <Button label="Change avatar" />
                        <Button label="Delete account" red />
                    </div>
                </div>
            </div>
        )
    );
}

function SectionTitle(props: { text: string }) {
    return <h1 className="font-bold text-3xl mb-2">{props.text}</h1>;
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
            className={`block ${props.red ? "bg-red" : "bg-blue"} px-8 py-3 mb-4 cursor-pointer rounded-md transition-colors text-lg font-bold ${props.red ? "hover:bg-red/70" : "hover:bg-blue/70"}`}
            type="button"
            value={props.label}
        />
    );
}
