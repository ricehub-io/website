import { FormButton } from "../form/FormButton";
import { useContext } from "preact/hooks";
import { addNotification, AppState } from "../../lib/appState";
import { apiFetch } from "../../lib/api";
import { HttpStatus } from "../../lib/enums";
import { useLocation } from "preact-iso";

export default function DeleteRiceModal() {
    const { route } = useLocation();
    const { currentModal, currentRiceId } = useContext(AppState);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;

        console.log(
            `sending request to delete rice with ID ${currentRiceId.value}`
        );

        try {
            const [status, _] = await apiFetch(
                "DELETE",
                `/rices/${currentRiceId.value}`
            );
            if (status === HttpStatus.NoContent) {
                target.reset();
                currentRiceId.value = null;
                addNotification("Rice", "Rice has been deleted", "info");
                route("/", true);
            }
        } catch (e) {
            if (e instanceof Error) {
                addNotification(
                    "Rice",
                    `Failed to delete: ${e.message}`,
                    "error"
                );
            }
        }
    };

    return (
        <form onSubmit={onSubmit} onReset={() => (currentModal.value = null)}>
            <div className="text-lg leading-5 mx-2 mb-2">
                <p>Are you sure you want to delete this rice?</p>
                <b>This action is irreversible.</b>
            </div>
            <div className="flex gap-2">
                <FormButton label="No" type="reset" />
                <FormButton label="Yes" type="submit" />
            </div>
        </form>
    );
}
