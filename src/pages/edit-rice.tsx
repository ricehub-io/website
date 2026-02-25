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
import { formatBytes } from "../lib/math";
import PageTitle from "../components/PageTitle";
import FormTitle from "../components/form/FormTitle";
import FilePreview from "../components/form/FilePreview";
import {
    CarouselImage,
    CarouselPlusButton,
} from "../components/form/FormImageCarousel";

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
        apiFetch<Rice>("GET", `/rices/${riceId}`).then(([status, body]) => {
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
                "Oh no!",
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

    const onDotfilesDelete = () => (newDotfiles.value = true);

    if (rice.value === null) {
        return;
    }

    return (
        <div className="bg-bright-background/40 mx-auto box-border w-full rounded-lg p-6 sm:p-8 md:mt-6 md:w-[min(70%,500px)]">
            <PageTitle text="Edit Rice" className="mb-4 text-center" />
            <form onSubmit={onSubmit} className="flex flex-col gap-2 md:gap-4">
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
                    // show existing dotfiles
                    <div>
                        <FormLabel label="Dotfiles" />
                        <FilePreview
                            fileName="dotfiles.zip"
                            fileSize={rice.value.dotfiles.fileSize}
                            onDelete={onDotfilesDelete}
                        />
                    </div>
                ) : (
                    // no existing dotfiles, show input:file to user
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

    const deleteImage = (e: Event, targetIndex: number) => {
        e.preventDefault();

        const newFiles = images.value.filter(
            (_, index) => index !== targetIndex
        );

        let dt = new DataTransfer();
        newFiles.forEach((file) => dt.items.add(file));
        carouselInput.current.files = dt.files;
        images.value = newFiles;
    };

    const deleteExistingPreview = (
        e: Event,
        targetIndex: number,
        id: string
    ) => {
        e.preventDefault();

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
                className="flex flex-nowrap items-center gap-2 overflow-x-auto pr-4 pb-2"
                onMouseEnter={onContainerHover}
                onMouseLeave={onContainerUnHover}
                onWheel={horizontalScroll}
            >
                {noPreviews.value ? (
                    <div className="text-gray bg-bright-background border-gray/50 flex aspect-video w-86 items-center justify-center rounded-lg border-2">
                        <PhotoIcon />
                    </div>
                ) : (
                    <>
                        {rice.value.previews.map((preview, index) => (
                            <CarouselImage
                                key={preview.id}
                                url={preview.url}
                                onDelete={(e) =>
                                    deleteExistingPreview(e, index, preview.id)
                                }
                            />
                        ))}
                        {images.value.map((image, index) => (
                            <CarouselImage
                                url={URL.createObjectURL(image)}
                                onDelete={(e) => deleteImage(e, index)}
                            />
                        ))}
                    </>
                )}

                <CarouselPlusButton name="previews[]" />
                <input
                    ref={carouselInput}
                    className="hidden"
                    multiple
                    type="file"
                    name="previews[]"
                    id="previews[]"
                    accept="image/png, image/jpeg"
                    onChange={onFileSelect}
                />
            </div>
        </div>
    );
}
