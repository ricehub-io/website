import { apiFetchV2 } from "@/api/apiFetch";
import { FormButton } from "@/components/form/FormButton";
import { FormInput } from "@/components/form/FormInput";
import { AppState, addNotification } from "@/lib/appState";
import { HttpStatus } from "@/lib/enums";
import { useContext } from "preact/hooks";

export default function ChangePasswordModal() {
    const { currentModal, user } = useContext(AppState);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;
        const formData = new FormData(target);

        const oldPassword = formData.get("curPassword");
        const newPassword = formData.get("newPassword");

        try {
            const [status, _] = await apiFetchV2(
                "PATCH",
                `/users/${user.value.id}/password`,
                JSON.stringify({
                    oldPassword,
                    newPassword,
                })
            );
            if (status === HttpStatus.NoContent) {
                addNotification(
                    "Password",
                    "Your password has been changed",
                    "info"
                );
                target.reset();
            }
        } catch (e) {
            if (e instanceof Error) {
                addNotification(
                    "Password",
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
                    label="Current password"
                    name="curPassword"
                    type="password"
                    placeholder="************"
                />
                <FormInput
                    label="New password"
                    name="newPassword"
                    type="password"
                    placeholder="************"
                />
            </div>
            <div className="mt-2 flex gap-2">
                <FormButton label="Cancel" type="reset" />
                <FormButton label="Confirm" type="submit" />
            </div>
        </form>
    );
}
