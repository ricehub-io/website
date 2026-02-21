import { signal, Signal } from "@preact/signals";
import { createContext, createRef } from "preact";
import { AppNotification, NotificationSeverity, User } from "./models";
import { API_URL, refreshToken } from "./api";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import { useRef } from "preact/hooks";
import { cssDurationToMs } from "./math";

type ModalType =
    | "login"
    | "register"
    | "changeDisplayName"
    | "changePassword"
    | "changeAvatar"
    | "deleteAvatar"
    | "deleteAccount"
    | "deleteRice"
    | "report"
    | "admin_deleteResource"
    | null;

type CallbackFn = () => void;

interface ReportContext {
    resourceType: "rice" | "comment";
    resourceId: string;
}

interface StateValues {
    currentModal: Signal<ModalType>;
    notifications: Signal<AppNotification[]>;
    accessToken: Signal<string>;
    user: Signal<User>;
    userLoading: Signal<boolean>;

    // modals signals
    // TODO: create an interface for this like i did with report context
    currentRiceId: Signal<string>; // used in DeleteRiceModal to know which one user wants to delete
    report: Signal<ReportContext>;
    // this is awful
    modalCallback: Signal<CallbackFn>;
}

export const AppState = createContext<StateValues>(null);

const notifications = signal<AppNotification[]>([]);
export const accessToken = signal(null);
export function createAppState(): StateValues {
    const currentModal = signal(null);
    const user = signal(null);
    const userLoading = signal(true);
    const currentRiceId = signal(null);
    const report = signal(null);
    const modalCallback = signal(null);

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

    return {
        currentModal,
        notifications,
        accessToken,
        user,
        userLoading,
        currentRiceId,
        report,
        modalCallback,
    };
}

export function addNotification(
    title: string,
    message: string,
    severity: NotificationSeverity
) {
    const id = uuidv4();
    notifications.value = [
        { id, title, message, severity, htmlRef: createRef() },
        ...notifications.value,
    ];

    setTimeout(() => {
        const removeNotification = () => {
            notifications.value = notifications.value.filter(
                (notif) => notif.id !== id
            );
        };

        const notif = notifications.value.find((n) => n.id === id);

        if (!notif.htmlRef) {
            removeNotification();
            return;
        }

        const el = notif.htmlRef.current;
        el.style.opacity = "0";

        const styles = getComputedStyle(el);
        const waitTime = cssDurationToMs(styles.transitionDuration);

        setTimeout(removeNotification, waitTime);
    }, 7500);
}
