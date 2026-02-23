import { useContext } from "preact/hooks";
import { AppState } from "../lib/appState";
import { AppNotification } from "../lib/models";
import { InfoIcon } from "./icons/InfoIcon";
import { WarningIcon } from "./icons/WarningIcon";
import { ErrorIcon } from "./icons/ErrorIcon";
import { For } from "@preact/signals/utils";
import { useComputed } from "@preact/signals";

export default function NotificationConsumer() {
    const { notifications } = useContext(AppState);
    const notifsRev = useComputed(() => notifications.value.reverse());

    // TODO: create notification queue, so no more than 4 are
    // shown at once to not obstruct user's view

    return (
        <div className="fixed top-16 left-0 w-full px-4 sm:w-auto sm:px-0 sm:left-auto sm:right-6 sm:max-w-114">
            <For each={notifsRev}>
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
                <h3 className="mb-0.5 font-bold text-base sm:text-lg xl:text-xl">
                    {title}
                </h3>
                <p className="leading-5 text-sm sm:text-base xl:text-lg">
                    {message}
                </p>
            </div>
        </div>
    );
}
