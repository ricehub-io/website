import { apiFetch } from "@/api/apiFetch";
import { PartialRice } from "@/api/schemas";
import WaitingRice from "@/components/admin/WaitingRice";
import { addNotification } from "@/lib/appState";
import { HttpStatus } from "@/lib/enums";
import { useSignal } from "@preact/signals";
import { For } from "@preact/signals/utils";
import { useEffect } from "preact/hooks";

interface WaitingRiceListProps {
    refreshInterval: number;
}

export default function WaitingRiceList({
    refreshInterval,
}: WaitingRiceListProps) {
    const rices = useSignal<PartialRice[]>([]);

    const fetchRices = async () => {
        apiFetch<PartialRice[]>("GET", "/rices?state=waiting")
            .then(([_, body]) => (rices.value = body))
            .catch((e) => {
                if (e instanceof Error) {
                    addNotification(
                        "Failed to fetch waiting rices",
                        e.message,
                        "error"
                    );
                }
            });
    };

    // periodically fetch waiting rices
    useEffect(() => {
        const interval = setInterval(fetchRices, refreshInterval ?? 60 * 1000);
        fetchRices();

        return () => clearInterval(interval);
    }, []);

    const acceptRice = async (rice: PartialRice) => {
        try {
            const [status, _] = await apiFetch(
                "PATCH",
                `/rices/${rice.id}/state`,
                JSON.stringify({
                    newState: "accepted",
                })
            );

            if (status !== HttpStatus.Ok) {
                throw new Error(
                    `Unexpected response code received from API: ${status}`
                );
            }

            rices.value = rices.value.filter((r) => r.id !== rice.id);
            addNotification("Success", "Rice has been accepted", "info");
        } catch (e) {
            if (e instanceof Error) {
                addNotification("Something went wrong", e.message, "error");
            }
        }
    };

    const rejectRice = async (rice: PartialRice) => {
        try {
            const [status, _] = await apiFetch(
                "PATCH",
                `/rices/${rice.id}/state`,
                JSON.stringify({
                    newState: "rejected",
                })
            );

            if (status !== HttpStatus.NoContent) {
                throw new Error(
                    `Unexpected response code received from API: ${status}`
                );
            }

            rices.value = rices.value.filter((r) => r.id !== rice.id);
            addNotification("Success", "Rice has been rejected", "info");
        } catch (e) {
            if (e instanceof Error) {
                addNotification("Something went wrong", e.message, "error");
            }
        }
    };

    return (
        <div className="bg-bright-background flex flex-col gap-2 rounded-lg p-4">
            <For
                each={rices}
                fallback={
                    <p className="my-6 text-center font-medium sm:text-xl">
                        No pending rices
                    </p>
                }
            >
                {(rice, _) => (
                    <WaitingRice
                        key={rice.id}
                        {...rice}
                        onAccept={() => acceptRice(rice)}
                        onReject={() => rejectRice(rice)}
                    />
                )}
            </For>
        </div>
    );
}
