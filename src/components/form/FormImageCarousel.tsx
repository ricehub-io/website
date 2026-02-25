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

export function FormImageCarousel({ label, name }: Props) {
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

    const deleteImage = (e: Event, targetIndex: number) => {
        e.preventDefault();

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
                className="flex flex-nowrap items-center gap-2 overflow-x-auto pr-4 pb-2"
                onMouseEnter={onContainerHover}
                onMouseLeave={onContainerUnHover}
                onWheel={horizontalScroll}
            >
                {images.value.length > 0 ? (
                    images.value.map((image, index) => (
                        <CarouselImage
                            key={index}
                            url={URL.createObjectURL(image)}
                            onDelete={(e) => deleteImage(e, index)}
                        />
                    ))
                ) : (
                    <div className="text-gray bg-bright-background border-gray/50 flex aspect-video h-30 items-center justify-center rounded-lg border-2 sm:h-40 md:h-50">
                        <PhotoIcon className="size-24 sm:size-36" />
                    </div>
                )}

                <CarouselPlusButton name={name} />
                <input
                    ref={input}
                    className="hidden"
                    multiple
                    type="file"
                    name={name}
                    id={name}
                    accept="image/png, image/jpeg"
                    onChange={onFileSelect}
                    required
                />
            </div>
        </div>
    );
}

export function CarouselImage({
    url,
    onDelete,
}: {
    url: string;
    onDelete: (Event) => void;
}) {
    return (
        <div className="carousel-image-container relative">
            <img
                className="h-30 rounded-md sm:h-40 md:h-50"
                src={url}
                alt="carousel's image"
            />
            <button
                className="bg-red/40 border-red/60 hover:bg-red/20 absolute right-2 bottom-2 cursor-pointer rounded-md border p-2 transition-colors"
                onClick={onDelete}
            >
                <TrashIcon className="size-5 sm:size-6" />
            </button>
        </div>
    );
}

export function CarouselPlusButton({ name }: { name: string }) {
    return (
        <label
            className="bg-bright-background border-gray/30 hover:bg-bright-background/50 hover:text-foreground/70 ml-1 cursor-pointer rounded-lg border p-2 transition-colors sm:ml-2 sm:p-3"
            htmlFor={name}
        >
            <PlusIcon className="size-5 sm:size-6" />
        </label>
    );
}
