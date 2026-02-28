import { TargetedEvent, useContext, useEffect } from "preact/compat";
import ReportList from "../components/admin/ReportList";
import ResourceList from "../components/admin/ResourceList";
import Statistics from "../components/admin/Statistics";
import { FormButton } from "../components/form/FormButton";
import { FormInput, FormInputProps } from "../components/form/FormInput";
import FormTextArea from "../components/form/FormTextArea";
import SectionTitle from "../components/SectionTitle";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { addNotification, AppState } from "@/lib/appState";
import { ApiError, apiFetch } from "@/lib/api";
import { User, UserWithBan } from "@/lib/models";
import { HttpStatus } from "@/lib/enums";
import { useSignal } from "@preact/signals";
import { For } from "@preact/signals/utils";
import Bullet from "@/components/Bullet";
import moment from "moment";
import TextButton from "@/components/admin/TextButton";

const DURATION_REGEX = /^\d+(h|m|s)$/;
const REPORTS_REFRESH_INTERVAL = 60 * 1000; // 60s

export default function AdminPage() {
    return (
        <div className="mx-auto w-full xl:w-[min(80%,1200px)]">
            <div className="mb-6">
                <SectionTitle text="Statistics" />
                <Statistics />
            </div>
            <div className="mb-6 flex w-full gap-6">
                <div className="flex-1">
                    <SectionTitle text="Reports" />
                    <ReportList refreshInterval={REPORTS_REFRESH_INTERVAL} />
                </div>
                <div className="flex-1">
                    <SectionTitle text="Recents" />
                    <ResourceList />
                </div>
            </div>
            <div className="flex w-full gap-6">
                <div className="flex-1">
                    <SectionTitle text="Ban User" />
                    <BanUserForm />
                </div>
                <div className="flex-1">
                    <SectionTitle text="Banned Users" />
                    <BanList />
                </div>
            </div>
        </div>
    );
}

function BanUserForm() {
    const onSubmit = async (e: TargetedEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // check if any user identifier has been provided
        const username = formData.get("username").toString().trim();
        let userId = formData.get("userId").toString().trim();

        if (username === "" && userId === "") {
            addNotification(
                "Form Error",
                "At least one user identifier must be provided",
                "error"
            );
            return;
        }

        if (username !== "" && userId !== "") {
            addNotification(
                "Form Error",
                "Too many user identifiers provided",
                "error"
            );
            return;
        }

        if (userId !== "" && !uuidValidate(userId)) {
            addNotification(
                "User ID",
                "Invalid user ID provided! It must be a valid UUID.",
                "error"
            );
            return;
        }

        if (username !== "") {
            // fetch user id
            try {
                const [_, body] = await apiFetch<User>(
                    "GET",
                    `/users?username=${username}`
                );

                userId = body.id;
                console.log(
                    `successfully fetched user id from username: ${userId}`
                );
            } catch (e) {
                if (e instanceof ApiError) {
                    addNotification(
                        "Failed to fetch user data",
                        e.message,
                        "error"
                    );
                    return;
                }
            }
        }

        // validate reason
        const reason = formData.get("reason").toString();
        if (reason.trim() === "") {
            addNotification(
                "Form Error",
                "You need to provide a ban reason",
                "error"
            );
            return;
        }

        // validate duration
        let duration = formData.get("duration").toString().trim();
        if (duration !== "" && !DURATION_REGEX.test(duration)) {
            addNotification(
                "Form Error",
                "Failed to parse duration. Proper syntax: [non-negative number][one of: d, h, m, s], example: 7d, 10m, 15s.",
                "error"
            );
            return;
        } else if (duration === "") {
            // otherwise API will try to parse an empty
            // duration string and return error
            duration = null;
        }

        try {
            const [status, _] = await apiFetch(
                "POST",
                `/users/${userId}/ban`,
                JSON.stringify({
                    reason,
                    duration,
                })
            );

            if (status !== HttpStatus.Created) {
                throw new Error(
                    `Unexpected status code received from API: ${status}`
                );
            }

            addNotification("Success", "User has been banned", "info");
        } catch (e) {
            if (e instanceof ApiError) {
                addNotification("Failed to ban user", e.message, "error");
            }
        }
    };

    return (
        <form
            onSubmit={onSubmit}
            className="bg-bright-background rounded-lg px-8 py-4"
        >
            <Input label="Username" name="username" placeholder="JohnDoe912" />
            <Input label="User ID" name="userId" placeholder={uuidv4()} />
            <FormTextArea
                label="Reason"
                name="reason"
                className="!bg-background-2"
                placeholder="ToS violation"
                rows={5}
            />
            <Input label="Duration" name="duration" placeholder="7d" />
            <div className="mt-2 flex gap-4">
                <FormButton
                    label="Reset"
                    type="reset"
                    className="!bg-blue/70 hover:!bg-blue/50"
                />
                <FormButton
                    label="Ban"
                    type="submit"
                    // for some reason i dont need to use !important on bg-red but on bg-blue I have to, otherwise it doesnt work XD
                    className="bg-red/70 hover:bg-red/50"
                />
            </div>
        </form>
    );
}

// ugly ban list, need to restyle it later when I have more time
function BanList() {
    const { unbanCtx, modalCallback, currentModal } = useContext(AppState);

    const bans = useSignal<UserWithBan[]>([]);

    useEffect(() => {
        apiFetch<UserWithBan[]>("GET", "/users?status=banned")
            .then(([_, body]) => (bans.value = body))
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification(
                        "Failed to fetch ban list",
                        e.message,
                        "error"
                    );
                }
            });
    }, []);

    const unbanUser = async () => {
        if (unbanCtx.value === null) {
            addNotification(
                "Something went wrong",
                "Unban function called with invalid context",
                "error"
            );
            return;
        }

        try {
            const [status, _] = await apiFetch(
                "DELETE",
                `/users/${unbanCtx.value.id}/ban`
            );

            if (status !== HttpStatus.NoContent) {
                throw new Error(
                    `Unexpected status code received from API: ${status}`
                );
            }

            bans.value = bans.value.filter(
                ({ user }) => user.id !== unbanCtx.value.id
            );
            addNotification("Success", "User has been unbanned", "info");
            unbanCtx.value = null;
        } catch (e) {
            if (e instanceof Error) {
                addNotification("Failed to unban user", e.message, "error");
            }
        }
    };

    const onUnbanClick = (user: User) => {
        unbanCtx.value = user;
        modalCallback.value = unbanUser;
        currentModal.value = "admin_unban";
    };

    return (
        <div className="bg-bright-background flex flex-col gap-2 rounded-lg p-4">
            <For
                each={bans}
                fallback={
                    <p className="my-6 text-center text-xl font-medium">
                        No users have been banned yet :)
                    </p>
                }
            >
                {({ user, ban }, _) => (
                    <div className="bg-background-2 rounded-md p-4">
                        <div className="mx-1 flex items-center justify-between gap-2">
                            <a
                                className="hover:text-foreground/80 text-lg font-medium underline transition-colors"
                                href={`/${user.username}`}
                                target="_blank"
                            >
                                {user.displayName}
                            </a>
                            <Bullet />
                            <p className="text-bright-gray/80">
                                @{user.username}
                            </p>
                            <Bullet />
                            <p className="text-bright-gray/80">
                                created {moment(user.createdAt).fromNow()}
                            </p>
                        </div>
                        <p className="bg-gray/20 my-1 rounded-md p-4">
                            {ban.reason}
                        </p>
                        <div className="mx-1 flex items-center justify-between gap-2">
                            <p>
                                banned:{" "}
                                <span className="font-medium">
                                    {moment(ban.bannedAt).format(
                                        "DD/MM/YYYY, HH:mm:ss"
                                    )}
                                </span>
                            </p>
                            <Bullet />
                            <p>
                                expires in:{" "}
                                <span className="font-medium">
                                    {ban.expiresAt !== undefined
                                        ? moment(ban.expiresAt).toNow(true)
                                        : "never"}
                                </span>
                            </p>
                            <Bullet />
                            <TextButton
                                text="unban"
                                onClick={() => onUnbanClick(user)}
                            />
                        </div>
                    </div>
                )}
            </For>
        </div>
    );
}

const Input = (props: FormInputProps) => (
    <FormInput
        {...props}
        type="text"
        className="!bg-background-2"
        notRequired
    />
);
