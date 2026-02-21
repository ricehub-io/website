import { useSignal } from "@preact/signals";
import pluralize from "pluralize";
import { ChangeEvent } from "preact/compat";
import { useEffect } from "preact/hooks";
import { apiFetch } from "../../lib/api";
import { addNotification } from "../../lib/appState";
import { HttpStatus } from "../../lib/enums";
import { ReportWithUser } from "../../lib/models";
import Report from "./Report";
import ListWrapper from "./ListWrapper";

interface ReportListProps {
    refreshInterval: number;
}

export default function ReportList({ refreshInterval }: ReportListProps) {
    const reports = useSignal<ReportWithUser[]>([]);
    const filter = useSignal<string>("open");
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
        console.log("fetch reports");
        apiFetch<ReportWithUser[]>("GET", "/reports")
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

    const changeFiltering = (e: ChangeEvent) => {
        const target = e.currentTarget as HTMLInputElement;
        filter.value = target.value;
    };

    const closeReport = async (reportId: string) => {
        console.log(`sending request to close report with ID ${reportId}`);
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

    return (
        <ListWrapper
            label={pluralize("item", filteredReports.value.length, true)}
            buttons={[
                {
                    text: "Open",
                    name: "status",
                    value: "open",
                    onChange: changeFiltering,
                    defaultChecked: true,
                },
                {
                    text: "Closed",
                    name: "status",
                    value: "closed",
                    onChange: changeFiltering,
                },
            ]}
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
                <h3 className="my-6 text-center text-2xl font-bold">
                    No user reports found :D
                </h3>
            )}
        </ListWrapper>
    );
}
