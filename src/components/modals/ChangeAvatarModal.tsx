import { useContext } from "preact/hooks";
import { FormButton } from "../form/FormButton";
import { addNotification, AppState } from "../../lib/appState";
import { apiFetch } from "../../lib/api";
import { HttpStatus } from "../../lib/enums";
import FormLabel from "../form/FormLabel";
import { FormInput } from "../form/FormInput";

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
            if (status === HttpStatus.Created) {
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
        <form onSubmit={onSubmit} onReset={() => (currentModal.value = null)}>
            <div>
                <FormInput
                    label="New avatar"
                    type="file"
                    name="file"
                    id="file"
                    accept="image/jpeg, image/png"
                    className="cursor-pointer"
                />
            </div>
            <div className="mt-2 flex gap-2">
                <FormButton label="Cancel" type="reset" />
                <FormButton label="Confirm" type="submit" />
            </div>
        </form>
    );
}
