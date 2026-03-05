import { useContext } from "preact/hooks";
import { useLocation } from "preact-iso";
import { apiFetchV2 } from "@/api/apiFetch";
import { FormButton } from "@/components/form/FormButton";
import { FormInput } from "@/components/form/FormInput";
import { AppState, addNotification } from "@/lib/appState";
import { HttpStatus } from "@/lib/enums";

export default function DeleteAccountModal() {
    const { route } = useLocation();
    const { currentModal, user, accessToken } = useContext(AppState);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;
        const formData = new FormData(target);

        const password = formData.get("password");

        try {
            const [status, _] = await apiFetchV2(
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
                await apiFetchV2("POST", "/auth/logout");
                accessToken.value = null;
                user.value = null;

                route("/", true);
            }
        } catch (e) {
            if (e instanceof Error) {
                addNotification("Something went wrong", e.message, "error");
            }
        }
    };

    return (
        <form onSubmit={onSubmit} onReset={() => (currentModal.value = null)}>
            <div>
                <FormInput
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="************"
                />
            </div>
            <div className="mt-2 flex gap-2">
                <FormButton label="Cancel" type="reset" />
                <FormButton label="Delete" type="submit" />
            </div>
        </form>
    );
}
