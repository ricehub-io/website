import { useContext } from "preact/hooks";
import { FormButton } from "../form/FormButton";
import { FormInput } from "../form/FormInput";
import { addNotification, AppState } from "../../lib/appState";
import { apiFetch } from "../../lib/api";

export default function ChangePasswordModal() {
    const { currentModal, user } = useContext(AppState);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;
        const formData = new FormData(target);

        const oldPassword = formData.get("curPassword");
        const newPassword = formData.get("newPassword");

        try {
            const [status, body] = await apiFetch(
                "PATCH",
                `/users/${user.value.id}/password`,
                JSON.stringify({
                    oldPassword,
                    newPassword,
                })
            );
            if (status === 204) {
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
            <FormInput
                label="Current Password"
                name="curPassword"
                type="password"
                placeholder="************"
            />
            <FormInput
                label="New Password"
                name="newPassword"
                type="password"
                placeholder="************"
            />
            <div className="flex gap-2">
                <FormButton label="Cancel" type="reset" />
                <FormButton label="Confirm" type="submit" />
            </div>
        </form>
    );
}
