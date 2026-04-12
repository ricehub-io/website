import { ChangeEvent, TargetedEvent, useEffect, useRef } from "preact/compat";
import { useComputed, useSignal } from "@preact/signals";
import FilePreview from "@/components/form/FilePreview";
import FormLabel from "@/components/form/FormLabel";
import { addNotification } from "@/lib/appState";

interface FormFileUploadProps {
    label: string;
    name: string;
    /** Accept must be a full MIME type like `application/zip` or `image/jpeg`. It cannot be an extension. */
    accept?: string;
    /** Max uploaded file size in format <size><unit>, e.g. 10MB, 512kB */
    maxSize: string;
}

export default function FormFileUpload({
    label,
    name,
    accept,
    maxSize,
}: FormFileUploadProps) {
    const inputRef = useRef<HTMLInputElement>();

    const isDragging = useSignal(false);
    const selectedFile = useSignal<File>(null);
    const hasSelected = useComputed(() => selectedFile.value !== null);

    useEffect(() => {
        const dt = new DataTransfer();

        if (selectedFile.value) {
            // set new file
            dt.items.add(selectedFile.value);
        }
        // else: remove file - set empty data transfer

        inputRef.current.files = dt.files;
    }, [selectedFile.value]);

    const deleteFile = () => {
        selectedFile.value = null;
    };

    const onFileSelect = (e: TargetedEvent<HTMLInputElement, ChangeEvent>) => {
        const file = e.currentTarget.files[0];
        if (!file) {
            return;
        }

        selectedFile.value = file;
    };

    // drag-n-drop logic
    const dragOver = (e: TargetedEvent<HTMLLabelElement, DragEvent>) => {
        e.preventDefault();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            isDragging.value = true;
        }
    };

    const dragLeave = () => (isDragging.value = false);

    const onDrop = (e: TargetedEvent<HTMLLabelElement, DragEvent>) => {
        e.preventDefault();
        isDragging.value = false;

        const files = e.dataTransfer.files;
        if (files.length > 1) {
            addNotification(
                "Too many files",
                "You can only upload one file",
                "error"
            );
            return;
        }

        const file = files.item(0);
        if (!file) {
            addNotification(
                "Something went wrong",
                "Could not extract the file from drop event. Please try again.",
                "error"
            );
            return;
        }

        // check if file type is correct
        const acceptedTypes = inputRef.current.accept
            .replaceAll(" ", "")
            .split(",");
        if (!acceptedTypes.some((type) => file.type === type)) {
            addNotification(
                "Incorrect type",
                "Incorrect file type dropped! Try again with different one.",
                "error"
            );
            return;
        }

        selectedFile.value = file;
    };

    return (
        <div>
            <FormLabel label={label} />
            {hasSelected.value ? (
                <FilePreview
                    fileName={selectedFile.value.name}
                    fileSize={selectedFile.value.size}
                    onDelete={deleteFile}
                />
            ) : (
                <>
                    {/* file uploading for PCs */}
                    <label
                        className={`border-bright-background group flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors select-none [@media(hover:none)]:hidden ${isDragging.value ? "border-gray/30 bg-bright-background/30" : "hover:border-gray/30 hover:bg-bright-background/30"}`}
                        htmlFor={name}
                        onDragOver={dragOver}
                        onDragLeave={dragLeave}
                        onDrop={onDrop}
                    >
                        <span className="bg-bright-background group-hover:bg-gray/20 rounded-md px-6 py-3 transition-colors">
                            Choose a file
                        </span>
                        <span className="mx-4">or</span>
                        <span>drag it here</span>
                    </label>
                    {/* file uploading for mobile devices */}
                    <label
                        htmlFor={name}
                        className="bg-blue/40 border-blue/70 hidden rounded-md border p-4 [@media(hover:none)]:block"
                    >
                        Touch to select a file
                    </label>
                    {/* size limit text */}
                    {/* TODO: fetch limit from API */}
                    <p className="text-gray mt-0.5 text-right text-sm sm:text-base">
                        Max file size: {maxSize}
                    </p>
                </>
            )}
            <input
                ref={inputRef}
                className="hidden"
                type="file"
                name={name}
                id={name}
                onChange={onFileSelect}
                accept={accept}
            />
        </div>
    );
}
