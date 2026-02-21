import { useEffect } from "preact/hooks";
import { apiFetch } from "../../lib/api";
import { useSignal } from "@preact/signals";
import { ServiceStatistics } from "../../lib/models";

export default function Statistics() {
    const stats = useSignal<ServiceStatistics>(null);

    useEffect(() => {
        console.log("fetching service stats");
        // TODO: catch exceptions
        apiFetch<ServiceStatistics>("GET", "/admin/stats").then(
            ([_, body]) => (stats.value = body)
        );
    }, []);

    return (
        stats.value !== null && (
            <div className="flex gap-4">
                {/* total user count, number of new users in 24h, total rice count, number of new rices in 24h, total comment count, number of comments in 24h, report count, open report count */}
                <StatsCard
                    value={1522}
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
        <div className="bg-bright-background border-background-2 rounded-2xl border-2 p-8 px-10">
            <p className="font-jetbrains-mono text-3xl font-bold">
                {value}
                <span className="ml-1">({secondValue})</span>
            </p>
            <p className="text-gray mt-1">{label}</p>
        </div>
    );
}
