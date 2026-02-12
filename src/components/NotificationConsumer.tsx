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
        <div className="absolute right-6 top-16 max-w-114">
            <For each={notifications}>
                {(notif, index) => <Notification key={index} {...notif} />}
            </For>
        </div>
    );
}

function Notification({ title, message, severity }: AppNotification) {
    return (
        <div
            className={`flex items-center gap-3 bg-dark-background pl-4 pr-6 py-4 rounded-lg border-2 border-blue ${
                severity === "error" && "border-red"
            } ${severity === "warning" && "border-orange"} not-last:mb-2`}
        >
            <div className="w-12">
                {severity === "info" && <InfoIcon />}
                {severity === "warning" && <WarningIcon />}
                {severity === "error" && <ErrorIcon />}
            </div>
            <div>
                <h3 className="font-bold mb-0.5">{title}</h3>
                <p className="leading-5">{message}</p>
            </div>
        </div>
    );
}
