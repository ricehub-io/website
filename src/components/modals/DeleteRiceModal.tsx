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
            if (status !== HttpStatus.NoContent) {
                throw new Error(
                    "Unexpected error occured when trying to delete rice! Please try again later."
                );
            }

            target.reset();
            route("/", true);
            addNotification("Rice", "Rice has been deleted", "info");
        } catch (e) {
            if (e instanceof Error) {
                addNotification("Something went wrong", e.message, "error");
            }
        }
    };

    const closeModal = () => {
        currentModal.value = null;
        currentRiceId.value = null;
    };

    return (
        <form onSubmit={onSubmit} onReset={closeModal}>
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
