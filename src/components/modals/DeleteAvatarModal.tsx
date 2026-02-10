import { useContext } from "preact/hooks";
import { FormButton } from "../form/FormButton";
import { FormInput } from "../form/FormInput";
import { addNotification, AppState } from "../../lib/appState";
import { API_URL, apiFetch } from "../../lib/api";
import { useLocation } from "preact-iso";

export default function DeleteAvatarModal() {
    const { currentModal, user } = useContext(AppState);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;

        try {
            const [status, body] = await apiFetch<{ avatarUrl: string }>(
                "DELETE",
                `/users/${user.value.id}/avatar`
            );

            if (status === 200) {
                user.value = {
                    ...user.value,
                    avatarUrl: body.avatarUrl,
                };
                addNotification(
                    "Avatar",
                    "Your avatar has been deleted",
                    "info"
                );
                target.reset();
            }
        } catch (e) {
            if (e instanceof Error) {
                addNotification(
                    "Avatar",
                    `Failed to delete: ${e.message}`,
                    "error"
                );
            }
        }
    };

    return (
        <form onSubmit={onSubmit} onReset={() => (currentModal.value = null)}>
            <p className="mb-6 text-lg leading-5 mx-2">
                Are you sure you want to delete your current avatar?
            </p>
            <div className="flex gap-2">
                <FormButton label="No" type="reset" />
                <FormButton label="Yes" type="submit" />
            </div>
        </form>
    );
}
