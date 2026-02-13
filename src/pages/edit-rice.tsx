import { useLocation, useRoute } from "preact-iso";
import { useContext, useEffect, useRef } from "preact/hooks";
import { apiFetch } from "../lib/api";
import { Rice } from "../lib/models";
import { FormButton } from "../components/form/FormButton";
import FormFileUpload from "../components/form/FormFileUpload";
import { FormInput } from "../components/form/FormInput";
import FormTextArea from "../components/form/FormTextArea";
import { signal, useComputed, useSignal } from "@preact/signals";
import { HttpStatus } from "../lib/enums";
import DocumentIcon from "../components/icons/DocumentIcon";
import TrashIcon from "../components/icons/TrashIcon";
import FormLabel from "../components/form/FormLabel";
import { addNotification, AppState } from "../lib/appState";
import PlusIcon from "../components/icons/PlusIcon";
import { ChangeEvent, createRef } from "preact/compat";
import PhotoIcon from "../components/icons/PhotoIcon";

const deletedPreviews = signal<string[]>([]);
const rice = signal<Rice>(null);
const carouselInput = createRef<HTMLInputElement>();

export default function EditRicePage() {
    const route = useRoute();
    const { riceId } = route.params;
    const { route: redirect } = useLocation();

    const { user } = useContext(AppState);
    const newDotfiles = useSignal(false);
    const submitted = useSignal(false);

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

        const newPreviews = carouselInput.current.files.length > 0;
        if (
            deletedPreviews.value.length >= rice.value.previews.length &&
            !newPreviews
        ) {
            addNotification(
                "Edit Rice",
                "At least one rice preview is required!",
                "error"
            );
            return;
        }

        submitted.value = true;
        const temp = async () => {
            const title = formData.get("title");
            const description = formData.get("description");
            if (
                title !== rice.value.title ||
                description !== rice.value.description
            ) {
                await apiFetch(
                    "PATCH",
                    `/rices/${riceId}`,
                    JSON.stringify({ title, description })
                );
            }

            if (newDotfiles.value) {
                const file = formData.get("dotfiles") as File;
                const tempData = new FormData();
                tempData.set("file", file);
                await apiFetch("POST", `/rices/${riceId}/dotfiles`, tempData);
            }

            const deletePreviews = async () => {
                for (const pId of deletedPreviews.value) {
                    await apiFetch(
                        "DELETE",
                        `/rices/${riceId}/previews/${pId}`
                    );
                }
            };

            // we need to first upload previews and then delete existing ones
            if (newPreviews) {
                const previews = formData.getAll("previews[]") as File[];

                for (const preview of previews) {
                    const tempData = new FormData();
                    tempData.set("file", preview);
                    await apiFetch(
                        "POST",
                        `/rices/${riceId}/previews`,
                        tempData
                    );
                }

                await deletePreviews();
            } else {
                await deletePreviews();
            }

            redirect(`/${user.value.username}/${rice.value.slug}`);
        };

        temp();
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
                    <CustomCarousel />
                    <FormButton
                        label="Update"
                        type="submit"
                        disabled={submitted.value}
                    />
                </form>
            </div>
        )
    );
}

function CustomCarousel() {
    const container = useRef<HTMLDivElement>(null);
    const images = useSignal<File[]>([]);
    const noPreviews = useComputed(
        () => rice.value.previews.length + images.value.length <= 0
    );

    const onFileSelect = (e: ChangeEvent) => {
        const target = e.target as HTMLInputElement;
        images.value = Array.from(target.files);
    };

    const deleteImage = (targetIndex: number) => {
        const newFiles = images.value.filter(
            (_, index) => index !== targetIndex
        );

        let dt = new DataTransfer();
        newFiles.forEach((file) => dt.items.add(file));
        carouselInput.current.files = dt.files;
        images.value = newFiles;
    };

    const deleteExistingPreview = (targetIndex: number, id: string) => {
        deletedPreviews.value.push(id);
        const newPreviews = rice.value.previews.filter(
            (_, index) => index !== targetIndex
        );
        rice.value = {
            ...rice.value,
            previews: newPreviews,
        };
    };

    const onContainerHover = () => {
        document.body.style.overflow = "hidden";
    };

    const onContainerUnHover = () => {
        document.body.style.overflow = "auto";
    };

    const horizontalScroll = (e: WheelEvent) => {
        container.current.scrollLeft += e.deltaY > 0 ? 50 : -50;
    };

    return (
        <div>
            <FormLabel label="Screenshots" />
            <div
                ref={container}
                className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-2 pr-4"
                onMouseEnter={onContainerHover}
                onMouseLeave={onContainerUnHover}
                onWheel={horizontalScroll}
            >
                {noPreviews.value ? (
                    <div className="flex items-center justify-center rounded-lg text-gray bg-bright-background w-86 border-2 border-gray/50 aspect-video">
                        <PhotoIcon />
                    </div>
                ) : (
                    <>
                        {rice.value.previews.map((preview, index) => (
                            <div
                                key={preview.id}
                                className="carousel-image-container relative border-2 rounded-md border-gray/50"
                            >
                                <img
                                    className="w-86 rounded-lg"
                                    src={preview.url}
                                    alt="Rice Screenshot"
                                />
                                <button
                                    className="absolute right-2 bottom-2 bg-red/40 border border-red/60 p-2 rounded-md cursor-pointer transition-colors hover:bg-red/20"
                                    onClick={(e: Event) => {
                                        e.preventDefault();
                                        deleteExistingPreview(
                                            index,
                                            preview.id
                                        );
                                    }}
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                        {images.value.map((image, index) => (
                            <div
                                key={index}
                                className="carousel-image-container relative border-2 rounded-md border-gray/50"
                            >
                                <img
                                    className="w-86 rounded-lg"
                                    src={URL.createObjectURL(image)}
                                    alt="Rice Screenshot"
                                />
                                <button
                                    className="absolute right-2 bottom-2 bg-red/40 border border-red/60 p-2 rounded-md cursor-pointer transition-colors hover:bg-red/20"
                                    onClick={(e: Event) => {
                                        e.preventDefault();
                                        deleteImage(index);
                                    }}
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </>
                )}

                <label
                    className="flex bg-bright-background border border-gray/30 w-12 h-12 aspect-square rounded-lg items-center justify-center cursor-pointer transition-colors ml-2 hover:bg-bright-background/50 hover:text-foreground/70"
                    htmlFor="previews[]"
                >
                    <PlusIcon />
                </label>
                <input
                    ref={carouselInput}
                    className="hidden"
                    multiple
                    type="file"
                    name="previews[]"
                    id="previews[]"
                    accept="image/png, image/jpeg"
                    onChange={onFileSelect}
                    onSubmit={() => console.log("submit previews")}
                />
            </div>
        </div>
    );
}
