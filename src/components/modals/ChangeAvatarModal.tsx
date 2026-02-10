import { useContext } from "preact/hooks";
import { FormButton } from "../FormButton";
import { addNotification, AppState } from "../../lib/appState";
import { apiFetch } from "../../lib/api";

export default function ChangeAvatarModal() {
    const { currentModal, user } = useContext(AppState);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;
        const formData = new FormData(target);

        try {
            const [status, body] = await apiFetch<{ avatarUrl: string }>(
                "POST",
                `/users/${user.value.id}/avatar`,
                formData
            );
            if (status === 201) {
                target.reset();
                user.value = {
                    ...user.value,
                    avatarUrl: body.avatarUrl,
                };
                addNotification(
                    "Avatar",
                    "Your avatar has been changed",
                    "info"
                );
            }
        } catch (e) {
            if (e instanceof Error) {
                addNotification(
                    "Avatar",
                    `Failed to change: ${e.message}`,
                    "error"
                );
            }
        }
    };

    return (
        <form
            className="max-w-84"
            onSubmit={onSubmit}
            onReset={() => (currentModal.value = null)}
        >
            <label className="block mb-2" htmlFor="file">
                Upload new avatar
            </label>
            <input
                className="avatar-input block cursor-pointer w-full bg-bright-background p-4 rounded-md mb-2"
                type="file"
                name="file"
                id="file"
                accept="image/jpeg, image/png"
            />

            <div className="flex gap-2">
                <FormButton label="Cancel" type="reset" />
                <FormButton label="Confirm" type="submit" />
            </div>
        </form>
    );
}
