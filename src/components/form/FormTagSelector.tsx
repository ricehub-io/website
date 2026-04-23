import { apiFetch } from "@/api/apiFetch";
import { Tag, TagSchema } from "@/api/schemas";
import { addNotification } from "@/lib/appState";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

export interface FormTagSelectorProps {
    /** Array of tag IDs that should be pre-selected */
    selected?: number[];
}

export default function FormTagSelector({
    selected = [],
}: FormTagSelectorProps) {
    const tags = useSignal<Tag[]>([]);

    useEffect(() => {
        apiFetch("GET", "/tags", null, TagSchema.array())
            .then(([, body]) => (tags.value = body))
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification(
                        "Failed to fetch available tags",
                        e.message,
                        "warning"
                    );
                }
            });
    }, []);

    return (
        <select
            name="tags"
            id="tags"
            className="cursor-pointer appearance-none outline-none"
            multiple
        >
            {tags.value.map((tag, idx) => (
                <option
                    key={idx}
                    value={tag.id}
                    className="mb-1 appearance-none rounded-sm px-2 py-1 text-lg outline-none"
                    selected={selected.includes(tag.id)}
                >
                    {tag.name}
                </option>
            ))}
        </select>
    );
}
