import { useContext, useEffect } from "preact/hooks";
import { AppNotification, PartialRice } from "../lib/models";
import { effect, Signal, useSignal } from "@preact/signals";
import { RicePreview } from "../components/RicePreview";
import { API_URL } from "../lib/api";
import { Placeholder } from "../components/Placeholder";
import { addNotification, AppState } from "../lib/appState";

async function getRices(
    accessToken?: string,
): Promise<PartialRice[]> {
    try {
        const res = await fetch(`${API_URL}/rices`, {
            headers:
                accessToken !== null
                    ? {
                          Authorization: `Bearer ${accessToken}`,
                      }
                    : {},
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.error || "Internal server error");
        }

        return data;
    } catch (err) {
        addNotification(
            "API unreachable",
            "API is currently unavailable, please try again later",
            "error",
        );
        return [];
    }
}

export default function HomePage() {
    const { accessToken } = useContext(AppState);
    const rices = useSignal<PartialRice[]>([]);

    useEffect(() => {
        getRices(accessToken.value).then(
            (res) => (rices.value = res),
        );
    }, [accessToken.value]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rices.value.length > 0 ? (
                rices.value.map((rice) => <RicePreview {...rice} />)
            ) : (
                <>
                    <Placeholder className="aspect-video" />
                    <Placeholder className="aspect-video" />
                    <Placeholder className="aspect-video" />
                    <Placeholder className="aspect-video" />
                </>
            )}
        </div>
    );
}
