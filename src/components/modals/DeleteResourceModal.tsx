import { useContext } from "preact/hooks";
import { addNotification, AppState } from "../../lib/appState";
import { FormButton } from "../form/FormButton";
import { apiFetch } from "../../lib/api";
import { HttpStatus } from "../../lib/enums";

export default function DeleteResourceModal() {
    const { currentModal, report, modalCallback } = useContext(AppState);

    const deleteResource = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;

        try {
            const resId = report.value.resourceId;
            const endpoint =
                report.value.resourceType === "rice"
                    ? `/rices/${resId}`
                    : `/comments/${resId}`;
            const [status, body] = await apiFetch("DELETE", endpoint);
            if (status !== HttpStatus.NoContent) {
                console.log(`unexpected status: ${status}`);
                console.log(body);
                throw new Error(
                    "Unexpected response received from API when trying to delete resource. Check console for more information."
                );
            }

            addNotification("Deleted", "Resource has been deleted", "info");
            target.reset();
            modalCallback.value();
        } catch (e) {
            if (e instanceof Error) {
                addNotification("Couldn't delete resource", e.message, "error");
            }
        }
    };

    const closeModal = () => {
        currentModal.value = null;
        report.value = null;
    };

    return (
        <form onSubmit={deleteResource} onReset={closeModal}>
            <div className="text-lg leading-5 mx-2 mb-2">
                <p>
                    You are about to delete user's {report.value.resourceType}{" "}
                    as an admin action
                </p>
                <b>Please confirm to proceed</b>
            </div>
            <div className="flex gap-2">
                <FormButton label="No" type="reset" />
                <FormButton label="Yes" type="submit" />
            </div>
        </form>
    );
}
