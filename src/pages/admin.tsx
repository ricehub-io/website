import ReportList from "../components/admin/ReportList";
import ResourceList from "../components/admin/ResourceList";
import Statistics from "../components/admin/Statistics";
import SectionTitle from "../components/SectionTitle";

const REPORTS_REFRESH_INTERVAL = 60 * 1000; // 60s

export default function AdminPage() {
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
