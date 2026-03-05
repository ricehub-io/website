import { apiFetchV2 } from "@/api/apiFetch";
import { RiceSchema } from "@/api/schemas";
import { FormButton } from "@/components/form/FormButton";
import FormFileUpload from "@/components/form/FormFileUpload";
import { FormImageCarousel } from "@/components/form/FormImageCarousel";
import { FormInput } from "@/components/form/FormInput";
import FormTextArea from "@/components/form/FormTextArea";
import PageTitle from "@/components/PageTitle";
import { addNotification } from "@/lib/appState";
import { HttpStatus } from "@/lib/enums";
import { useLocation } from "preact-iso";

export default function NewRicePage() {
    const { route } = useLocation();

    const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;
        const formData = new FormData(target);

        try {
            const [status, _] = await apiFetchV2(
                "POST",
                "/rices",
                formData,
                RiceSchema
            );

            if (status !== HttpStatus.Created) {
                throw new Error(
                    `Unexpected status code received from API: ${status}`
                );
            }

            route("/");
            addNotification(
                "Success",
                "Your rice has been created and is pending approval by staff. You can check the status in your account page.",
                "info"
            );

            // if (status === HttpStatus.Created) {
            //     route(`/${user.value.username}/${body.slug}`);
            // }
        } catch (e) {
            if (e instanceof Error) {
                addNotification("Something went wrong", e.message, "error");
            }
        }
    };

    return (
        <div className="bg-bright-background/40 box-border w-full rounded-lg p-6 sm:p-8 md:mx-auto md:mt-6 md:w-[min(70%,500px)]">
            <PageTitle text="New Rice" className="mb-4 text-center" />
            <form onSubmit={onSubmit} className="flex flex-col gap-2 md:gap-4">
                <FormInput label="Title" name="title" type="text" />
                <FormTextArea label="Description" name="description" />
                <FormFileUpload name="dotfiles" accept=".zip" />
                <FormImageCarousel label="Screenshots" name="previews[]" />
                <FormButton label="Create" type="submit" />
            </form>
        </div>
    );
}
