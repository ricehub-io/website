import { useLocation } from "preact-iso";
import { useContext } from "preact/hooks";
import TextButton from "@/components/admin/TextButton";
import { apiFetch } from "@/api/apiFetch";
import { addNotification, AppState } from "@/lib/appState";
import { formatLocaleDate } from "@/lib/math";
import {
    CommentWithRiceSlugSchema,
    ReportWithUser,
    RiceSchema,
} from "@/api/schemas";

export default function Report({
    id,
    displayName,
    username,
    createdAt,
    reason,
    riceId,
    commentId,
    isClosed,
    onClose,
    forceRefresh,
}: ReportWithUser & {
    onClose: (reportId: string) => void;
    forceRefresh: () => void;
}) {
    const date = formatLocaleDate(createdAt);
    const isRice = riceId !== undefined;

    const { route } = useLocation();
    const {
        currentModal,
        reportCtx: report,
        modalCallback,
    } = useContext(AppState);

    const openTarget = async () => {
        try {
            if (isRice) {
                // fetch rice details by ID to get the slug
                const [, body] = await apiFetch(
                    "GET",
                    `/rices/${riceId}`,
                    null,
                    RiceSchema
                );

                route(`/${body.author.username}/${body.slug}`);
            } else {
                // fetch comment details to get rice slug so we can anchor link :333
                const [, body] = await apiFetch(
                    "GET",
                    `/comments/${commentId}`,
                    null,
                    CommentWithRiceSlugSchema
                );
                route(
                    `/${body.riceAuthorUsername}/${body.riceSlug}#${body.id}`
                );
            }
        } catch (e) {
            if (e instanceof Error) {
                addNotification(
                    "Failed to open target resource",
                    e.message,
                    "error"
                );
            }
        }
    };

    const onDeleteResource = async () => {
        report.value = {
            resourceType: isRice ? "rice" : "comment",
            resourceId: isRice ? riceId : commentId,
        };
        modalCallback.value = forceRefresh;
        currentModal.value = "admin_deleteResource";
    };

    return (
        <div className="bg-background-2 flex flex-col gap-1 rounded-md px-4 py-2 text-sm sm:text-base">
            <div className="flex items-center gap-1">
                <div className="flex flex-col items-center gap-2 sm:flex-row">
                    <p className="text-base font-bold sm:text-lg">
                        {displayName}
                    </p>
                    <p className="text-gray">(@{username})</p>
                </div>
                <p className="ml-auto">{date}</p>
            </div>
            <p className="bg-gray/20 my-2 rounded-md p-4">{reason}</p>
            <div className="flex flex-wrap justify-center gap-4">
                {!isClosed && (
                    <TextButton text="Close" onClick={() => onClose(id)} />
                )}
                <TextButton text="Go to" onClick={openTarget} />
                <TextButton text="Delete resource" onClick={onDeleteResource} />
                <TextButton text="Ban resource author" />
            </div>
        </div>
    );
}
