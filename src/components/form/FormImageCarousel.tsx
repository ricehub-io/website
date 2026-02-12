import { useSignal } from "@preact/signals";
import { ChangeEvent } from "preact/compat";
import { useRef } from "preact/hooks";
import PhotoIcon from "../icons/PhotoIcon";
import PlusIcon from "../icons/PlusIcon";
import TrashIcon from "../icons/TrashIcon";
import FormLabel from "./FormLabel";

interface Props {
    label: string;
    name: string;
}

export default function FormImageCarousel({ label, name }: Props) {
    const container = useRef<HTMLDivElement>(null);
    const input = useRef<HTMLInputElement>(null);
    const images = useSignal<File[]>([]);

    const onContainerHover = () => {
        // disable vertical page scroll
        document.body.style.overflow = "hidden";
    };

    const onContainerUnHover = () => {
        document.body.style.overflow = "auto";
    };

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
            <FormLabel label={label} />
            <div
                ref={container}
                className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-2 pr-4"
                onMouseEnter={onContainerHover}
                onMouseLeave={onContainerUnHover}
                onWheel={horizontalScroll}
            >
                {images.value.length > 0 ? (
                    images.value.map((image, index) => (
                        <div
                            key={index}
                            className="carousel-image-container relative border-2 rounded-md border-gray/50"
                        >
                            <img
                                className="w-86 rounded-lg"
                                src={URL.createObjectURL(image)}
                                alt={label}
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
                    ))
                ) : (
                    <div className="flex items-center justify-center rounded-lg text-gray bg-bright-background w-87 border-2 border-gray/50 aspect-video">
                        <PhotoIcon />
                    </div>
                )}

                <label
                    className="flex bg-bright-background border border-gray/30 w-12 h-12 aspect-square rounded-lg items-center justify-center cursor-pointer transition-colors ml-2 hover:bg-bright-background/50 hover:text-foreground/70"
                    htmlFor={name}
                >
                    <PlusIcon />
                </label>
                <input
                    ref={input}
                    className="hidden"
                    multiple
                    type="file"
                    name={name}
                    id={name}
                    accept="image/png, image/jpeg"
                    onChange={onFileSelect}
                />
            </div>
        </div>
    );
}
