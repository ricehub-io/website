import { useContext, useEffect } from "preact/hooks";
import { AppState } from "../lib/appState";
import { AppNotification } from "../lib/models";
import { InfoIcon } from "./icons/InfoIcon";
import { WarningIcon } from "./icons/WarningIcon";
import { ErrorIcon } from "./icons/ErrorIcon";
import { For } from "@preact/signals/utils";

export default function NotificationConsumer() {
    const { notifications } = useContext(AppState);

    return (
        <div className="fixed top-16 right-6 max-w-114">
            <For each={notifications}>
                {(notif) => <Notification key={notif.id} {...notif} />}
            </For>
        </div>
    );
}

function Notification({
    id,
    title,
    message,
    severity,
    htmlRef,
}: AppNotification) {
    return (
        <div
            ref={htmlRef}
            className={`bg-dark-background border-blue flex items-center gap-3 rounded-lg border-2 py-4 pr-6 pl-4 transition-opacity duration-500 ${
                severity === "error" && "border-red"
            } ${severity === "warning" && "border-orange"} not-last:mb-2`}
            id={id}
        >
            <div className="w-12">
                {severity === "info" && <InfoIcon />}
                {severity === "warning" && <WarningIcon />}
                {severity === "error" && <ErrorIcon />}
            </div>
            <div>
                <h3 className="mb-0.5 font-bold">{title}</h3>
                <p className="leading-5">{message}</p>
            </div>
        </div>
    );
}
