import { formatBytes } from "../../lib/math";
import DocumentIcon from "../icons/DocumentIcon";
import TrashIcon from "../icons/TrashIcon";

interface FilePreviewProps {
    fileName: string;
    fileSize: number;
    onDelete: () => void;
}

export default function FilePreview({
    fileName,
    fileSize,
    onDelete,
}: FilePreviewProps) {
    return (
        <div className="bg-bright-background flex items-center gap-2 rounded-lg px-3 py-2 sm:gap-4 sm:px-6 sm:py-4">
            <div className="bg-gray/40 rounded-lg p-2">
                <DocumentIcon className="size-6 sm:size-8" />
            </div>
            <div className="text-sm sm:text-base">
                <p className="font-medium">{fileName}</p>
                <p className="text-gray">{formatBytes(fileSize)}</p>
            </div>
            <button
                onClick={onDelete}
                className="bg-red/40 border-red/60 hover:text-foreground/70 hover:bg-red/40 ml-auto cursor-pointer rounded-md border p-2 transition-colors"
            >
                <TrashIcon className="size-5 sm:size-6" />
            </button>
        </div>
    );
}
