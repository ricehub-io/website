import { apiFetch } from "@/api/apiFetch";
import { NewAvatarSchema } from "@/api/schemas";
import { FormButton } from "@/components/form/FormButton";
import FormFileUpload from "@/components/form/FormFileUpload";
import { AppState, addNotification } from "@/lib/appState";
import { HttpStatus } from "@/lib/enums";
import { useContext } from "preact/hooks";

export default function ChangeAvatarModal() {
    const { currentModal, user } = useContext(AppState);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;
        const formData = new FormData(target);

        try {
            const [status, body] = await apiFetch(
                "POST",
                `/users/${user.value.id}/avatar`,
                formData,
                NewAvatarSchema
            );
            if (status === HttpStatus.Created) {
                target.reset();
                user.value = {
                    ...user.value,
                    avatarUrl: body.avatarUrl,
                };
                addNotification(
                    "Avatar",
                    "Your avatar has been changed",
                    "info"
                );
            }
        } catch (e) {
            if (e instanceof Error) {
                addNotification(
                    "Avatar",
                    `Failed to change: ${e.message}`,
                    "error"
                );
            }
        }
    };

    return (
        <form onSubmit={onSubmit} onReset={() => (currentModal.value = null)}>
            <div>
                <FormFileUpload
                    label="New avatar"
                    name="file"
                    accept="image/jpeg, image/png"
                    maxSize="5MB"
                />
                {/* <FormInput
                    label="New avatar"
                    type="file"
                    name="file"
                    id="file"
                    accept="image/jpeg, image/png"
                    className="cursor-pointer"
                />
                <p className="text-gray -mt-2 text-right text-sm sm:text-base">
                    Max file size: 5MB
                </p> */}
            </div>
            <div className="mt-2 flex gap-2">
                <FormButton label="Cancel" type="reset" />
                <FormButton label="Confirm" type="submit" />
            </div>
        </form>
    );
}
