import { useLocation, useRoute } from "preact-iso";
import { useContext, useEffect } from "preact/hooks";
import { apiFetch } from "../lib/api";
import { Rice } from "../lib/models";
import { FormButton } from "../components/form/FormButton";
import FormFileUpload from "../components/form/FormFileUpload";
import FormImageCarousel from "../components/form/FormImageCarousel";
import { FormInput } from "../components/form/FormInput";
import FormTextArea from "../components/form/FormTextArea";
import { useSignal } from "@preact/signals";
import { HttpStatus } from "../lib/enums";
import DocumentIcon from "../components/icons/DocumentIcon";
import TrashIcon from "../components/icons/TrashIcon";
import FormLabel from "../components/form/FormLabel";
import { AppState } from "../lib/appState";

export default function EditRicePage() {
    const route = useRoute();
    const { riceId } = route.params;
    const { route: redirect } = useLocation();

    const { user } = useContext(AppState);

    const rice = useSignal<Rice>(null);
    const newDotfiles = useSignal(false);
    const deletedPreviews = useSignal<string[]>([]);

    useEffect(() => {
        apiFetch<Rice>("get", `/rices/${riceId}`).then(([status, body]) => {
            if (status === HttpStatus.Ok) {
                rice.value = body;
            }
        });
    }, []);

    const onSubmit = (e: SubmitEvent) => {
        e.preventDefault();
        const target = e.currentTarget as HTMLFormElement;
        const formData = new FormData(target);

        const title = formData.get("title");
        const description = formData.get("description");
        if (
            title !== rice.value.title ||
            description !== rice.value.description
        ) {
            apiFetch(
                "PATCH",
                `/rices/${riceId}`,
                JSON.stringify({ title, description })
            );
        }

        if (newDotfiles.value) {
            const file = formData.get("dotfiles") as File;
            const tempData = new FormData();
            tempData.set("file", file);
            apiFetch("POST", `/rices/${riceId}/dotfiles`, tempData);
        }

        // for previews:
        // store a list of previews to be deleted
        // for each deleted preview send request
        deletedPreviews.value.forEach((previewId) => {
            apiFetch("DELETE", `/rices/${riceId}/previews/${previewId}`);
        });

        redirect(`/${user.value.username}/${rice.value.slug}`);
    };

    const onPreviewDelete = (targetIndex: number, id: string) => {
        deletedPreviews.value.push(id);
        const newPreviews = rice.value.previews.filter(
            (_, index) => index !== targetIndex
        );
        rice.value = {
            ...rice.value,
            previews: newPreviews,
        };
    };

    return (
        rice.value !== null && (
            <div className="new-rice-content mx-auto bg-bright-background/40 box-content p-8 rounded-lg mt-6">
                <h1 className="text-3xl font-bold mb-6 text-center">
                    Edit rice
                </h1>
                <form onSubmit={onSubmit} className="flex flex-col gap-4">
                    <FormInput
                        label="Title"
                        name="title"
                        type="text"
                        value={rice.value.title}
                    />
                    <FormTextArea
                        label="Description"
                        name="description"
                        value={rice.value.description}
                    />
                    {!newDotfiles.value ? (
                        <div>
                            <FormLabel label="Dotfiles" />
                            <div className="bg-bright-background flex items-center gap-4 px-6 py-4 rounded-lg">
                                <div className="bg-gray/40 p-2 rounded-lg">
                                    <DocumentIcon />
                                </div>
                                <div>
                                    <p className="font-medium">dotfiles.zip</p>
                                    <p className="text-gray">? kB</p>
                                </div>
                                <button
                                    onClick={() => (newDotfiles.value = true)}
                                    className="ml-auto bg-red/40 p-2 rounded-md border-red/60 border cursor-pointer transition-colors hover:text-foreground/70 hover:bg-red/40"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <FormFileUpload name="dotfiles" accept=".zip" />
                    )}
                    <div>
                        <FormLabel label="Screenshots" />
                        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-2 pr-4">
                            {rice.value.previews.map((preview, index) => (
                                <div
                                    key={preview.id}
                                    className="carousel-image-container relative border-2 rounded-md border-gray/50"
                                >
                                    <img
                                        className="w-86 rounded-lg"
                                        src={preview.url}
                                        alt="preview"
                                    />
                                    <button
                                        className="absolute right-2 bottom-2 bg-red/40 border border-red/60 p-2 rounded-md cursor-pointer transition-colors hover:bg-red/20"
                                        onClick={(e: Event) => {
                                            e.preventDefault();
                                            onPreviewDelete(index, preview.id);
                                        }}
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* <FormImageCarousel label="Screenshots" name="previews[]" /> */}
                    <FormButton label="Update" type="submit" />
                </form>
            </div>
        )
    );
}
