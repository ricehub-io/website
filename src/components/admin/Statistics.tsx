import { useEffect } from "preact/hooks";
import { useSignal } from "@preact/signals";
import { apiFetch } from "@/api/apiFetch";
import { ServiceStatistics, ServiceStatisticsSchema } from "@/api/schemas";
import { addNotification } from "@/lib/appState";

export default function Statistics() {
    const stats = useSignal<ServiceStatistics>(null);

    useEffect(() => {
        apiFetch("GET", "/admin/stats", null, ServiceStatisticsSchema)
            .then(([_, body]) => (stats.value = body))
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification(
                        "Failed to fetch service stats",
                        e.message,
                        "warning"
                    );
                }
            });
    }, []);

    return (
        stats.value !== null && (
            <div className="flex flex-wrap gap-4">
                <StatsCard
                    value={stats.value.userCount}
                    secondValue={stats.value.user24hCount}
                    label="Users Registered (24h)"
                />
                <StatsCard
                    value={stats.value.riceCount}
                    secondValue={stats.value.rice24hCount}
                    label="Rices Created (24h)"
                />
                <StatsCard
                    value={stats.value.commentCount}
                    secondValue={stats.value.comment24hCount}
                    label="Comments Posted (24h)"
                />
                <StatsCard
                    value={stats.value.reportCount}
                    secondValue={stats.value.openReportCount}
                    label="Reports Made (open)"
                />
            </div>
        )
    );
}

function StatsCard({
    value,
    secondValue,
    label,
}: {
    value: number;
    secondValue: number;
    label: string;
}) {
    return (
        <div className="bg-bright-background border-background-2 flex-1 rounded-2xl border-2 p-6 sm:p-8">
            <p className="font-jetbrains-mono text-xl font-bold sm:text-2xl md:text-3xl">
                {value}
                <span className="ml-1">({secondValue})</span>
            </p>
            <p className="text-gray mt-1 text-sm sm:text-base">{label}</p>
        </div>
    );
}
