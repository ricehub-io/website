import { signal, Signal } from "@preact/signals";
import { ComponentChildren, createContext, createRef, RefObject } from "preact";
import { jwtDecode } from "jwt-decode";
import { v4 as uuidv4 } from "uuid";
import { refreshToken, API_URL } from "@/api/apiFetch";
import { cssDurationToMs } from "@/lib/math";
import { User } from "@/api/schemas";

export type ModalType =
    | "login"
    | "register"
    | "changeDisplayName"
    | "changePassword"
    | "changeAvatar"
    | "deleteAvatar"
    | "deleteAccount"
    | "deleteRice"
    | "report"
    | "okay"
    | "admin_deleteResource"
    | "admin_unban"
    | null;

type CallbackFn = () => void;

export type NotificationSeverity = "info" | "warning" | "error";

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    severity: NotificationSeverity;
    htmlRef: RefObject<HTMLDivElement>;
}

interface ReportContext {
    resourceType: "rice" | "comment";
    resourceId: string;
}

interface OkayModalContext {
    /** HTML Content shown to user when modal opens up */
    content: ComponentChildren;
}

interface StateValues {
    currentModal: Signal<ModalType>;
    notifications: Signal<AppNotification[]>;
    accessToken: Signal<string>;
    user: Signal<User>;
    userLoading: Signal<boolean>;

    currentRiceId: Signal<string>;
    reportCtx: Signal<ReportContext>;
    unbanCtx: Signal<User>;
    okayModalCtx: Signal<OkayModalContext>;
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
    const reportCtx = signal(null);
    const unbanCtx = signal(null);
    const okayModalCtx = signal(null);
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
        reportCtx,
        unbanCtx,
        okayModalCtx,
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
