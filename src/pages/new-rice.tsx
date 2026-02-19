import { FormButton } from "../components/form/FormButton";
import FormFileUpload from "../components/form/FormFileUpload";
import { FormInput } from "../components/form/FormInput";
import FormTextArea from "../components/form/FormTextArea";
import FormImageCarousel from "../components/form/FormImageCarousel";
import { apiFetch } from "../lib/api";
import { HttpStatus } from "../lib/enums";
import { useLocation } from "preact-iso";
import { useContext } from "preact/hooks";
import { addNotification, AppState } from "../lib/appState";
import { Rice } from "../lib/models";

export default function NewRicePage() {
    const { route } = useLocation();
    const { user } = useContext(AppState);

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;
        const formData = new FormData(target);

        try {
            const [status, body] = await apiFetch<Rice>(
                "POST",
                "/rices",
                formData
            );

            if (status === HttpStatus.Created) {
                route(`/${user.value.username}/${body.slug}`);
            }
        } catch (e) {
            if (e instanceof Error) {
                addNotification("Oh no...", e.message, "error");
            }
        }
    };

    return (
        <div className="new-rice-content mx-auto bg-bright-background/40 box-content p-8 rounded-lg mt-6">
            <h1 className="text-3xl font-bold mb-6 text-center">
                Create a new rice
            </h1>
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <FormInput label="Title" name="title" type="text" />
                <FormTextArea label="Description" name="description" />
                <FormFileUpload name="dotfiles" accept=".zip" />
                <FormImageCarousel label="Screenshots" name="previews[]" />
                <FormButton label="Create" type="submit" />
            </form>
        </div>
    );
}
