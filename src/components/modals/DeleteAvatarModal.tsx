import { useContext } from "preact/hooks";
import { FormButton } from "../form/FormButton";
import { addNotification, AppState } from "../../lib/appState";
import { apiFetch } from "../../lib/api";
import { HttpStatus } from "../../lib/enums";

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

            if (status === HttpStatus.Ok) {
                user.value = {
                    ...user.value,
                    avatarUrl: body.avatarUrl,
                };
                addNotification(
                    "Account",
                    "Your avatar has been deleted",
                    "info"
                );
                target.reset();
            }
        } catch (e) {
            if (e instanceof Error) {
                addNotification("Something went wrong", e.message, "error");
            }
        }
    };

    return (
        <form onSubmit={onSubmit} onReset={() => (currentModal.value = null)}>
            <p className="mx-2 text-base leading-5 sm:text-lg">
                Are you sure you want to delete your current avatar?
            </p>
            <div className="mt-2 flex gap-2">
                <FormButton label="No" type="reset" />
                <FormButton label="Yes" type="submit" />
            </div>
        </form>
    );
}
