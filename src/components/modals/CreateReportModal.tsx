import { useContext } from "preact/hooks";
import { addNotification, AppState } from "../../lib/appState";
import { FormButton } from "../form/FormButton";
import FormTitle from "../form/FormTitle";
import FormTextArea from "../form/FormTextArea";
import { apiFetch } from "../../lib/api";
import { CreateReportReq, CreateReportRes } from "../../lib/models";
import { HttpStatus } from "../../lib/enums";

export default function CreateReportModal() {
    const { currentModal, report } = useContext(AppState);

    const sendReport = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;
        const formData = new FormData(target);

        try {
            const isRice = report.value.resourceType === "rice";
            const reqBody: CreateReportReq = {
                reason: formData.get("message") as string,
                ...(isRice
                    ? { riceId: report.value.resourceId }
                    : { commentId: report.value.resourceId }),
            };
            const [status, body] = await apiFetch<CreateReportRes>(
                "POST",
                "/reports",
                JSON.stringify(reqBody)
            );
            if (status !== HttpStatus.Created) {
                throw new Error(
                    "Unexpected error occured when trying to create report. Please try again later."
                );
            }

            addNotification(
                "Report",
                `Your report (ID: ${body.reportId}) has been sent! We will take care of it as fast as possible.`,
                "info"
            );

            target.reset();
        } catch (e) {
            if (e instanceof Error) {
                addNotification("Something went wrong", e.message, "error");
            }
        }
    };

    const closeModal = () => {
        currentModal.value = null;
        report.value = null;
    };

    return (
        <form onSubmit={sendReport} onReset={closeModal}>
            <FormTitle text="Report" />
            <FormTextArea
                name="message"
                placeholder="Describe the content or behavior you're reporting"
                rows={5}
                className="resize-none"
            />
            <div className="flex gap-2">
                <FormButton label="Cancel" type="reset" />
                <FormButton label="Send" type="submit" />
            </div>
        </form>
    );
}
