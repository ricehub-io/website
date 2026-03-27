import { apiFetch } from "@/api/apiFetch";
import { LoginSchema } from "@/api/schemas";
import { FormButton } from "@/components/form/FormButton";
import { FormInput } from "@/components/form/FormInput";
import FormTitle from "@/components/form/FormTitle";
import { AppState, addNotification } from "@/lib/appState";
import { HttpStatus } from "@/lib/enums";
import { useContext } from "preact/compat";

export default function LoginModal() {
    const { currentModal, accessToken, user } = useContext(AppState);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;

        const formData = new FormData(target);
        const username = formData.get("username").toString();
        const password = formData.get("password").toString();

        try {
            const [status, body] = await apiFetch(
                "POST",
                "/auth/login",
                JSON.stringify({ username, password }),
                LoginSchema,
                true
            );

            if (status !== HttpStatus.Ok) {
                throw new Error(
                    `Unexpected status code received from API: ${status}`
                );
            }

            accessToken.value = body.accessToken;
            user.value = body.user;

            target.reset();
            addNotification(
                "Login",
                "You successfully logged into an account!",
                "info"
            );
        } catch (e) {
            if (e instanceof Error) {
                addNotification("Failed to login", e.message, "error");
            }
        }
    };

    return (
        <form
            className="flex flex-col gap-2"
            onSubmit={onSubmit}
            onReset={() => (currentModal.value = null)}
        >
            <FormTitle text="Login" />
            <div>
                <FormInput
                    label="Username"
                    name="username"
                    type="text"
                    placeholder="SatoshiNakamoto43"
                />
                <FormInput
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="********"
                />
            </div>
            <div className="flex gap-2">
                <FormButton label="Cancel" type="reset" />
                <FormButton label="Login" type="submit" />
            </div>
        </form>
    );
}
