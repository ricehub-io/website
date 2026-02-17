import { useContext } from "preact/hooks";
import { FormButton } from "../form/FormButton";
import { FormInput } from "../form/FormInput";
import { addNotification, AppState } from "../../lib/appState";
import { API_URL, apiFetch } from "../../lib/api";
import { useLocation } from "preact-iso";
import { HttpStatus } from "../../lib/enums";

export default function DeleteAccountModal() {
    const { route } = useLocation();
    const { currentModal, user, accessToken } = useContext(AppState);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;
        const formData = new FormData(target);

        const password = formData.get("password");

        try {
            const [status, body] = await apiFetch(
                "DELETE",
                `/users/${user.value.id}`,
                JSON.stringify({
                    password,
                })
            );
            if (status === HttpStatus.NoContent) {
                addNotification(
                    "Account",
                    "Your account has been deleted",
                    "info"
                );
                target.reset();

                // log out
                fetch(`${API_URL}/auth/logout`, {
                    method: "POST",
                    credentials: "include",
                });
                accessToken.value = null;
                user.value = null;

                route("/", true);
            }
        } catch (e) {
            if (e instanceof Error) {
                addNotification(
                    "Account",
                    `Failed to delete: ${e.message}`,
                    "error"
                );
            }
        }
    };

    return (
        <form onSubmit={onSubmit} onReset={() => (currentModal.value = null)}>
            <FormInput
                label="Password"
                name="password"
                type="password"
                placeholder="************"
            />
            <div className="flex gap-2">
                <FormButton label="Cancel" type="reset" />
                <FormButton label="Delete" type="submit" />
            </div>
        </form>
    );
}
