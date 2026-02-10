import { useSignal } from "@preact/signals";
import { FormButton } from "../components/form/FormButton";
import FormFileUpload from "../components/form/FormFileUpload";
import { FormInput } from "../components/form/FormInput";
import FormTextArea from "../components/form/FormTextArea";
import FormLabel from "../components/form/FormLabel";
import PhotoIcon from "../components/icons/PhotoIcon";
import { ChangeEvent, useRef } from "preact/compat";
import TrashIcon from "../components/icons/TrashIcon";

export default function NewRicePage() {
    /*
    title: string
    description: string
    dotfiles: file[zip]
    previews[]: file[png/jpeg]
    */

    return (
        <div className="new-rice-content mx-auto bg-bright-background/40 box-content p-8 rounded-lg mt-6">
            <h1 className="text-3xl font-bold mb-6 text-center">
                Create a new rice
            </h1>
            <form className="flex flex-col gap-4">
                <FormInput label="Title" name="title" type="text" />
                <FormTextArea label="Description" name="description" />
                <FormFileUpload name="dotfiles" accept=".zip" />
                <ImageCarouselUpload />
                <FormButton label="Create" type="submit" />
            </form>
        </div>
    );
}

function ImageCarouselUpload() {
    const container = useRef<HTMLDivElement>(null);
    const input = useRef<HTMLInputElement>(null);
    const images = useSignal<File[]>([]);

    const horizontalScroll = (e: WheelEvent) => {
        container.current.scrollLeft += e.deltaY > 0 ? 50 : -50;
    };

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
        input.current.files = dt.files;
        images.value = newFiles;
    };

    return (
        <div>
            <FormLabel label="Screenshots" />
            <div
                ref={container}
                className="flex flex-nowrap items-center gap-2 overflow-x-auto py-2"
                onWheel={horizontalScroll}
            >
                {/* <div className="text-gray bg-bright-background">
                    <PhotoIcon />
                </div> */}
                {images.value.map((image, index) => (
                    <div
                        key={index}
                        className="preview-container relative border-3 rounded-lg border-bright-background"
                    >
                        <img
                            className="w-86 rounded-md"
                            src={URL.createObjectURL(image)}
                            alt="screenshot"
                        />
                        <button
                            className="absolute right-4 bottom-4 bg-red/40 border border-red/60 p-2 rounded-md cursor-pointer transition-colors hover:bg-red/20"
                            onClick={(e: Event) => {
                                e.preventDefault();
                                deleteImage(index);
                            }}
                        >
                            <TrashIcon />
                        </button>
                    </div>
                ))}
                <label
                    className="flex bg-bright-background border border-gray/30 text-4xl font-bold w-12 h-12 aspect-square rounded-lg items-center justify-center cursor-pointer transition-colors ml-2 hover:bg-bright-background/50 hover:text-foreground/70"
                    htmlFor="previews[]"
                >
                    +
                </label>
                <input
                    ref={input}
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
