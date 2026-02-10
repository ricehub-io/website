import { signal, Signal } from "@preact/signals";
import { createContext } from "preact";
import { AppNotification, NotificationSeverity, User } from "./models";
import { API_URL, refreshToken } from "./api";
import { jwtDecode } from "jwt-decode";

type ModalType =
    | "login"
    | "register"
    | "changeDisplayName"
    | "changePassword"
    | "changeAvatar"
    | "deleteAccount"
    | null;

interface StateValues {
    currentModal: Signal<ModalType>;
    notifications: Signal<AppNotification[]>;
    accessToken: Signal<string>;
    user: Signal<User>;
    userLoading: Signal<boolean>;
}

export const AppState = createContext<StateValues>(null);

const notifications = signal([]);
export const accessToken = signal(null);
export function createAppState(): StateValues {
    const currentModal = signal(null);
    const user = signal(null);
    const userLoading = signal(true);

    const fetchUser = async () => {
        const token = await refreshToken();
        if (token) {
            const { sub } = jwtDecode(token);
            accessToken.value = token;

            const res = await fetch(`${API_URL}/users/${sub}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const body = await res.json();
                user.value = body;
            }
        }

        userLoading.value = false;
    };
    fetchUser();

    return { currentModal, notifications, accessToken, user, userLoading };
}

export function addNotification(
    title: string,
    message: string,
    severity: NotificationSeverity
) {
    const newIndex = notifications.value.length;
    notifications.value = [
        { title, message, severity },
        ...notifications.value,
    ];

    setTimeout(() => {
        // TODO: add fade out animation
        notifications.value = notifications.value.filter(
            (_, index) => newIndex !== index
        );
    }, 7500);
}
