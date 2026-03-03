import { apiFetch } from "@/api/apiFetch";
import { FormButton } from "@/components/form/FormButton";
import { FormInput } from "@/components/form/FormInput";
import { AppState, addNotification } from "@/lib/appState";
import { HttpStatus } from "@/lib/enums";
import { useContext } from "preact/hooks";

export default function ChangeDisplayNameModal() {
    const { currentModal, user } = useContext(AppState);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;
        const formData = new FormData(target);

        const displayName = formData.get("displayName") as string;

        try {
            const [status, _] = await apiFetch(
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
            <div>
                <FormInput
                    label="New display name"
                    name="displayName"
                    type="text"
                    placeholder="BlueApple923"
                />
            </div>
            <div className="mt-2 flex gap-2">
                <FormButton label="Cancel" type="reset" />
                <FormButton label="Confirm" type="submit" />
            </div>
        </form>
    );
}
