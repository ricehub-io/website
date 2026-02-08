import { useContext } from "preact/compat";
import { addNotification, AppState } from "../lib/appState";
import { API_URL } from "../lib/api";
import { LoginResponse } from "../lib/models";
import { FormInput } from "./FormInput";
import { FormButton } from "./FormButton";

async function login(
    username: string,
    password: string,
): Promise<LoginResponse> {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) {
        throw new Error(data.error || "Failed to login");
    }

    return data;
}

export function LoginModal() {
    const { currentModal, accessToken, user } = useContext(AppState);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;

        const formData = new FormData(target);
        const username = formData.get("username").toString();
        const password = formData.get("password").toString();

        try {
            const body = await login(username, password);
            accessToken.value = body.accessToken;
            user.value = body.user;
            target.reset();
            addNotification(
                "Login",
                "You successfully logged into an account!",
                "info",
            );
        } catch (err) {
            const errMsg = (err as Error).message;
            addNotification("Login failed", errMsg, "error");
        }
    };

    return (
        <form
            className="flex flex-col gap-6"
            onSubmit={onSubmit}
            onReset={() => (currentModal.value = null)}
        >
            <h1 className="text-center font-extrabold text-3xl mb-4">
                Login
            </h1>
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
