import { useContext } from "preact/hooks";
import { FormButton } from "../form/FormButton";
import { FormInput } from "../form/FormInput";
import { addNotification, AppState } from "../../lib/appState";
import { useSignal } from "@preact/signals";
import { API_URL } from "../../lib/api";

interface FormError {
    source: "username" | "displayName" | "password";
    message: string;
}

async function register(
    username: string,
    displayName: string,
    password: string
) {
    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                displayName,
                password,
            }),
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to register");
        }
    } catch (err) {
        throw err;
    }
}

export default function RegisterModal() {
    const { currentModal, notifications } = useContext(AppState);
    const formError = useSignal<FormError>(null);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;

        const formData = new FormData(target);
        const password = formData.get("password");
        const confirmPassword = formData.get("cpassword");

        if (password !== confirmPassword) {
            formError.value = {
                source: "password",
                message: "Password doesn't match!",
            };
            return;
        }

        const username = formData.get("username").toString();
        const displayName = formData.get("displayName").toString();

        try {
            await register(username, displayName, password.toString());
            addNotification(
                "Registered",
                "You have been successfully registered!",
                "info"
            );
            target.reset();
        } catch (err) {
            const errMsg = (err as Error).message;

            // I should add error identifiers to the API response...
            if (errMsg.includes("Username")) {
                formError.value = {
                    source: "username",
                    message: errMsg,
                };
            } else if (errMsg.includes("DisplayName")) {
                formError.value = {
                    source: "displayName",
                    message: errMsg,
                };
            } else {
                addNotification("Register failed", errMsg, "error");
            }
        }
    };

    const onUsernameInput = () => {
        if (formError.value?.source === "username") {
            formError.value = null;
        }
    };

    const onDisplayNameInput = () => {
        if (formError.value?.source === "displayName") {
            formError.value = null;
        }
    };

    const onPasswordInput = () => {
        if (formError.value?.source === "password") {
            formError.value = null;
        }
    };

    return (
        <form
            className="flex flex-col gap-6"
            onSubmit={onSubmit}
            onReset={() => (currentModal.value = null)}
        >
            <h1 className="text-center font-extrabold text-3xl mb-4">
                Register
            </h1>
            <div>
                <FormInput
                    label="Username"
                    name="username"
                    type="text"
                    placeholder="SatoshiNakamoto43"
                    onInput={onUsernameInput}
                    errorMsg={
                        formError.value?.source === "username"
                            ? formError.value.message
                            : null
                    }
                />
                <FormInput
                    label="Display Name"
                    name="displayName"
                    type="text"
                    placeholder="Mike Smith Jr."
                    onInput={onDisplayNameInput}
                    errorMsg={
                        formError.value?.source === "displayName"
                            ? formError.value.message
                            : null
                    }
                />
                <FormInput
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="********"
                    onInput={onPasswordInput}
                    errorMsg={
                        formError.value?.source === "password"
                            ? formError.value.message
                            : null
                    }
                />
                <FormInput
                    label="Confirm Password"
                    name="cpassword"
                    type="password"
                    placeholder="********"
                    onInput={onPasswordInput}
                    errorMsg={
                        formError.value?.source === "password"
                            ? formError.value.message
                            : null
                    }
                />
            </div>
            <div className="flex gap-2">
                <FormButton label="Cancel" type="reset" />
                <FormButton label="Register" type="submit" />
            </div>
        </form>
    );
}
