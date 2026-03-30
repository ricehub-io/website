import { FetchMethod, apiFetch, ApiError } from "@/api/apiFetch";
import ReactiveStarIcon from "@/components/icons/ReactiveStarIcon";
import { addNotification } from "@/lib/appState";
import { HttpStatus } from "@/lib/enums";
import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

interface StarButtonProps {
    riceId: string;
    stars: number;
    isStarred: boolean;
}

export default function StarButton({ riceId, ...props }: StarButtonProps) {
    const starCount = useSignal(props.stars);
    const isStarred = useSignal(props.isStarred);

    useEffect(() => {
        isStarred.value = props.isStarred;
    }, [props.isStarred]);

    const onStar = async (e: MouseEvent) => {
        e.stopPropagation();

        const method: FetchMethod = isStarred.value ? "DELETE" : "POST";

        try {
            const [status, _] = await apiFetch(method, `/rices/${riceId}/star`);

            if (status === HttpStatus.Created) {
                starCount.value += 1;
                isStarred.value = true;
            } else if (status === HttpStatus.NoContent) {
                starCount.value -= 1;
                isStarred.value = false;
            }
        } catch (e) {
            if (e instanceof ApiError) {
                if (e.statusCode === HttpStatus.Forbidden) {
                    addNotification(
                        "Forbidden",
                        "You must be logged in to do that",
                        "error"
                    );
                } else {
                    addNotification(
                        "Failed to star/unstar rice",
                        e.message,
                        "error"
                    );
                }
            }
        }
    };

    return (
        <div
            onClick={onStar}
            className="flex items-center gap-0.5 transition-colors duration-300 hover:cursor-pointer"
        >
            <ReactiveStarIcon
                solid={isStarred.value}
                className="!size-4 sm:!size-5"
            />
            <p
                className={`transition-colors duration-300 sm:text-lg ${
                    isStarred.value && "text-accent"
                }`}
            >
                {starCount}
            </p>
        </div>
    );
}
