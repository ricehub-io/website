import { useContext } from "preact/hooks";
import { useLocation } from "preact-iso";
import { apiFetch } from "@/api/apiFetch";
import { FormButton } from "@/components/form/FormButton";
import { AppState, addNotification } from "@/lib/appState";
import { HttpStatus } from "@/lib/enums";

export default function DeleteRiceModal() {
    const { currentModal, currentRiceId, modalCallback } = useContext(AppState);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;

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

            addNotification("Rice", "Rice has been deleted", "info");
            modalCallback.value?.();

            target.reset();
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
            <div className="mx-2 text-base leading-5 sm:text-lg">
                <p>Are you sure you want to delete this rice?</p>
                <b>This action is irreversible.</b>
            </div>
            <div className="mt-2 flex gap-2">
                <FormButton label="No" type="reset" />
                <FormButton label="Yes" type="submit" />
            </div>
        </form>
    );
}
