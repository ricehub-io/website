import { signal, Signal } from "@preact/signals";
import { createContext } from "preact";
import {
    AppNotification,
    NotificationSeverity,
    User,
} from "./models";

type ModalType = "login" | "register" | null;

interface StateValues {
    currentModal: Signal<ModalType>;
    notifications: Signal<AppNotification[]>;
    accessToken: Signal<string>;
    user: Signal<User>;
}

export const AppState = createContext<StateValues>(null);

const notifications = signal([]);
export const accessToken = signal(null);
export function createAppState(): StateValues {
    const currentModal = signal(null);
    const user = signal(null);

    return { currentModal, notifications, accessToken, user };
}

export function addNotification(
    title: string,
    message: string,
    severity: NotificationSeverity,
) {
    const newIndex = notifications.value.length;
    notifications.value = [
        { title, message, severity },
        ...notifications.value,
    ];

    setTimeout(() => {
        // TODO: add fade out animation
        notifications.value = notifications.value.filter(
            (_, index) => newIndex !== index,
        );
    }, 7500);
}
