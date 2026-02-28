import { useLocation } from "preact-iso";
import { useContext } from "preact/hooks";
import { apiFetch } from "../../lib/api";
import { AppState } from "../../lib/appState";
import { ReportWithUser, Rice, RiceCommentWithSlug } from "../../lib/models";
import { formatLocaleDate } from "../../lib/math";
import TextButton from "@/components/admin/TextButton";

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
        // TODO: catch exceptions
        if (isRice) {
            // fetch rice details by ID to get the slug
            const [_, body] = await apiFetch<Rice>("GET", `/rices/${riceId}`);
            route(`/${body.author.username}/${body.slug}`);
        } else {
            // fetch comment details to get rice slug so we can anchor link :333
            const [_, body] = await apiFetch<RiceCommentWithSlug>(
                "GET",
                `/comments/${commentId}`
            );
            route(`/${body.riceAuthorUsername}/${body.riceSlug}#${body.id}`);
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
        <div className="bg-background-2 flex flex-col gap-1 rounded-md px-4 py-2">
            <div>{/* add preview of reported content here */}</div>
            <div className="flex items-center gap-1">
                <p className="text-lg font-bold">{displayName}</p>
                <p className="text-gray">(@{username})</p>
                <p className="ml-auto">{date}</p>
            </div>
            <p className="bg-gray/20 rounded-md p-4">{reason}</p>
            <div className="mt-1 flex justify-center gap-4">
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
