import { useContext } from "preact/hooks";
import { FormButton } from "../FormButton";
import { FormInput } from "../FormInput";
import { AppState } from "../../lib/appState";
import { apiFetch } from "../../lib/api";

export default function ChangeDisplayNameModal() {
    const { currentModal, user } = useContext(AppState);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;
        const formData = new FormData(target);

        const displayName = formData.get("displayName");
        target.reset();

        const [status, body] = await apiFetch(
            "PATCH",
            `/users/${user.value.id}/displayName`,
            JSON.stringify({
                displayName,
            })
        );

        if (status === 204) {
            user.value = {
                displayName,
                ...user.value,
            };
            // unfortunately preact doesnt rerender account page when updated for some reason
            location.reload();
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
