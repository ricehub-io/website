import { apiFetch } from "@/api/apiFetch";
import { ReportWithUser, ReportWithUserSchema } from "@/api/schemas";
import ListWrapper from "@/components/admin/ListWrapper";
import Report from "@/components/admin/Report";
import { RadioButtonProps } from "@/components/RadioButton";
import { addNotification } from "@/lib/appState";
import { HttpStatus } from "@/lib/enums";
import { useSignal } from "@preact/signals";
import pluralize from "pluralize";
import { ChangeEvent, TargetedEvent } from "preact/compat";
import { useEffect } from "preact/hooks";

interface ReportListProps {
    refreshInterval: number;
}

const FILTER_OPTIONS = ["open", "closed"] as const;
type FilterOption = (typeof FILTER_OPTIONS)[number];

export default function ReportList({ refreshInterval }: ReportListProps) {
    const reports = useSignal<ReportWithUser[]>([]);
    const filter = useSignal<FilterOption>("open");
    const filteredReports = useSignal<ReportWithUser[]>([]);

    const filterReports = () => {
        filteredReports.value = reports.value.filter(
            (r) =>
                (filter.value === "open" && !r.isClosed) ||
                (filter.value === "closed" && r.isClosed)
        );
    };
    useEffect(filterReports, [reports.value, filter.value]);

    const fetchReports = () => {
        apiFetch("GET", "/reports", null, ReportWithUserSchema.array())
            .then(([_, body]) => (reports.value = body))
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification("API Error", e.message, "error");
                }
            });
    };

    // periodically fetch reports from API
    useEffect(() => {
        const interval = setInterval(
            fetchReports,
            refreshInterval ?? 60 * 1000
        );
        fetchReports();

        return () => clearInterval(interval);
    }, []);

    const changeFiltering = (
        e: TargetedEvent<HTMLInputElement, ChangeEvent>
    ) => {
        filter.value = e.currentTarget.value as FilterOption;
    };

    const closeReport = async (reportId: string) => {
        try {
            const [status, _] = await apiFetch(
                "POST",
                `/reports/${reportId}/close`
            );
            if (status !== HttpStatus.NoContent) {
                throw new Error(
                    "Something went wrong! Please try again later."
                );
            }

            reports.value = reports.value.map((report) => {
                if (report.id === reportId) {
                    report.isClosed = true;
                }
                return report;
            });
            addNotification("Success", "Report has been closed!", "info");
        } catch (e) {
            if (e instanceof Error) {
                addNotification("Error", e.message, "error");
            }
        }
    };

    const radioButtons: RadioButtonProps[] = FILTER_OPTIONS.map(
        (filter, index) => ({
            text: filter.charAt(0).toUpperCase() + filter.slice(1), // capitalize
            name: "status",
            value: filter,
            onChange: changeFiltering,
            defaultChecked: index === 0,
        })
    );

    return (
        <ListWrapper
            label={pluralize("item", filteredReports.value.length, true)}
            buttons={radioButtons}
        >
            {filteredReports.value.length > 0 ? (
                filteredReports.value.map((r) => (
                    <Report
                        key={r.id}
                        {...r}
                        onClose={closeReport}
                        forceRefresh={fetchReports}
                    />
                ))
            ) : (
                <p className="my-6 text-center font-medium sm:text-xl">
                    No user reports found :D
                </p>
            )}
        </ListWrapper>
    );
}
