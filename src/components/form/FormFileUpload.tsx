import { ChangeEvent } from "preact/compat";
import FormLabel from "./FormLabel";
import { useComputed, useSignal } from "@preact/signals";
import FilePreview from "./FilePreview";

interface Props {
    name: string;
    accept?: string;
}

export default function FormFileUpload({ name, accept }: Props) {
    const selectedFile = useSignal<File>(null);
    const hasSelected = useComputed(() => selectedFile.value !== null);

    const deleteFile = () => {
        selectedFile.value = null;
    };

    const onFileSelect = (e: ChangeEvent) => {
        const target = e.target as HTMLInputElement;
        const file = target.files[0];
        if (!file) {
            return;
        }

        selectedFile.value = file;
    };

    return (
        <div>
            <FormLabel label="Dotfiles" />
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
                        className="border-bright-background hover:border-gray/30 hover:bg-bright-background/30 group flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors select-none [@media(hover:none)]:hidden"
                        htmlFor={name}
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
                </>
            )}
            <input
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
