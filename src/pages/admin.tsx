import ReportList from "../components/admin/ReportList";
import ResourceList from "../components/admin/ResourceList";
import Statistics from "../components/admin/Statistics";

const REPORTS_REFRESH_INTERVAL = 60 * 1000; // 60s

export default function AdminPage() {
    const SectionTitle = ({ text }: { text: string }) => (
        <h1 className="mb-2 text-3xl font-bold">{text}</h1>
    );

    return (
        <div className="admin-page mx-auto">
            <div className="mb-6">
                <SectionTitle text="Statistics" />
                <Statistics />
            </div>
            <div className="flex w-full gap-6">
                <div className="flex-1">
                    <SectionTitle text="Reports" />
                    <ReportList refreshInterval={REPORTS_REFRESH_INTERVAL} />
                </div>
                <div className="flex-1">
                    <SectionTitle text="Recents" />
                    <ResourceList />
                </div>
            </div>
        </div>
    );
}
