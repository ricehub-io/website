import { useLocation, useRoute } from "preact-iso";
import { useContext, useEffect, useRef } from "preact/hooks";
import { signal, useComputed, useSignal } from "@preact/signals";
import { ChangeEvent, createRef, TargetedEvent } from "preact/compat";
import { apiFetchV2 } from "@/api/apiFetch";
import FilePreview from "@/components/form/FilePreview";
import { FormButton } from "@/components/form/FormButton";
import FormFileUpload from "@/components/form/FormFileUpload";
import { FormInput } from "@/components/form/FormInput";
import FormLabel from "@/components/form/FormLabel";
import FormTextArea from "@/components/form/FormTextArea";
import PageTitle from "@/components/PageTitle";
import { AppState, addNotification } from "@/lib/appState";
import { HttpStatus } from "@/lib/enums";
import { PhotoIcon } from "@heroicons/react/24/solid";
import {
    CarouselImage,
    CarouselPlusButton,
} from "@/components/form/FormImageCarousel";
import { Rice, RiceSchema } from "@/api/schemas";

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
        apiFetchV2("GET", `/rices/${riceId}`, null, RiceSchema)
            .then(([status, body]) => {
                if (status !== HttpStatus.Ok) {
                    throw new Error(
                        `Unexpected status code received from API: ${status}`
                    );
                }
                rice.value = body;
            })
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification(
                        "Failed to fetch rice data",
                        e.message,
                        "error"
                    );
                }
            });
    }, []);

    // ugh i need to find a better way of wrapping apiFetch with error catching
    // too many try {} catch blocks - tho still less than `if let Some()` or `?` in Rust
    const onSubmit = (e: TargetedEvent<HTMLFormElement, SubmitEvent>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

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

        const temp = async () => {
            const title = formData.get("title").toString();
            const description = formData.get("description").toString();
            if (
                title !== rice.value.title ||
                description !== rice.value.description
            ) {
                try {
                    await apiFetchV2(
                        "PATCH",
                        `/rices/${riceId}`,
                        JSON.stringify({ title, description })
                    );
                } catch (e) {
                    if (e instanceof Error) {
                        addNotification(
                            "Failed to update metadata",
                            e.message,
                            "error"
                        );
                    }
                    return;
                }
            }

            if (newDotfiles.value) {
                const file = formData.get("dotfiles") as File;
                const tempData = new FormData();
                tempData.set("file", file);
                try {
                    await apiFetchV2(
                        "POST",
                        `/rices/${riceId}/dotfiles`,
                        tempData
                    );
                } catch (e) {
                    if (e instanceof Error) {
                        addNotification(
                            "Failed to update dotfiles",
                            e.message,
                            "error"
                        );
                    }
                    return;
                }
            }

            const deletePreviews = async () => {
                for (const pId of deletedPreviews.value) {
                    try {
                        await apiFetchV2(
                            "DELETE",
                            `/rices/${riceId}/previews/${pId}`
                        );
                    } catch (e) {
                        if (e instanceof Error) {
                            addNotification(
                                "Failed to delete preview",
                                e.message,
                                "error"
                            );
                        }
                        return;
                    }
                }
            };

            // we need to first upload previews and then delete existing ones
            if (newPreviews) {
                const previews = formData.getAll("previews[]") as File[];

                for (const preview of previews) {
                    const tempData = new FormData();
                    tempData.set("file", preview);
                    try {
                        await apiFetchV2(
                            "POST",
                            `/rices/${riceId}/previews`,
                            tempData
                        );
                    } catch (e) {
                        if (e instanceof Error) {
                            addNotification(
                                "Failed to add preview",
                                e.message,
                                "error"
                            );
                        }
                        return;
                    }
                }

                await deletePreviews();
            } else {
                await deletePreviews();
            }

            redirect(`/${user.value.username}/${rice.value.slug}`);
        };

        submitted.value = true;
        temp();
        submitted.value = false;
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
                        <PhotoIcon className="size-36" />
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
            <p className="text-gray text-right text-sm sm:text-base">
                Max preview image size: 5MB
            </p>
        </div>
    );
}
