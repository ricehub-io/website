import { ChangeEvent } from "preact/compat";
import FormLabel from "./FormLabel";
import { useSignal } from "@preact/signals";
import { formatBytes } from "../../lib/math";
import DocumentIcon from "../icons/DocumentIcon";
import TrashIcon from "../icons/TrashIcon";

interface Props {
    name: string;
    accept?: string;
}

export default function FormFileUpload({ name, accept }: Props) {
    const selectedFile = useSignal<File | null>(null);

    const removeFile = () => {
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
            {selectedFile.value !== null ? (
                <div className="bg-bright-background flex items-center gap-4 px-6 py-4 rounded-lg">
                    <div className="bg-gray/40 p-2 rounded-lg">
                        <DocumentIcon />
                    </div>
                    <div>
                        <p className="font-medium">{selectedFile.value.name}</p>
                        <p className="text-gray">
                            {formatBytes(selectedFile.value.size)}
                        </p>
                    </div>
                    <button
                        onClick={removeFile}
                        className="ml-auto bg-red/40 p-2 rounded-md border-red/60 border cursor-pointer transition-colors hover:text-foreground/70 hover:bg-red/40"
                    >
                        <TrashIcon />
                    </button>
                </div>
            ) : (
                <label
                    className="flex items-center justify-center border-2 border-dashed p-8 border-bright-background rounded-lg cursor-pointer transition-colors hover:border-gray/30 hover:bg-bright-background/30 group"
                    htmlFor={name}
                >
                    <span className="bg-bright-background px-6 py-3 rounded-md transition-colors group-hover:bg-gray/20">
                        Choose a file
                    </span>
                    <span className="mx-4">or</span>
                    <span>drag it here</span>
                </label>
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
