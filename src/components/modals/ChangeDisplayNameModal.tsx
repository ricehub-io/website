import { useContext } from "preact/hooks";
import { FormButton } from "../form/FormButton";
import { FormInput } from "../form/FormInput";
import { addNotification, AppState } from "../../lib/appState";
import { apiFetch } from "../../lib/api";
import { HttpStatus } from "../../lib/enums";

export default function ChangeDisplayNameModal() {
    const { currentModal, user } = useContext(AppState);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;
        const formData = new FormData(target);

        const displayName = formData.get("displayName") as string;

        try {
            const [status, body] = await apiFetch(
                "PATCH",
                `/users/${user.value.id}/displayName`,
                JSON.stringify({
                    displayName,
                })
            );

            if (status === HttpStatus.NoContent) {
                user.value = {
                    ...user.value,
                    displayName,
                };
                addNotification(
                    "Display Name",
                    "Your display name has been changed",
                    "info"
                );
                target.reset();
            }
        } catch (e) {
            if (e instanceof Error) {
                addNotification(
                    "Display Name",
                    `Failed to change: ${e.message}`,
                    "error"
                );
            }
        }
    };

    return (
        <form onSubmit={onSubmit} onReset={() => (currentModal.value = null)}>
            <FormInput
                label="New Display Name"
                name="displayName"
                type="text"
                placeholder="BlueApple923"
            />
            <div className="flex gap-2">
                <FormButton label="Cancel" type="reset" />
                <FormButton label="Confirm" type="submit" />
            </div>
        </form>
    );
}
