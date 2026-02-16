import { accessToken, addNotification } from "./appState";

export const API_URL: string =
    window.__APP_CONFIG__?.API_URL ?? "http://127.0.0.1:3000";

type FetchMethod =
    | "GET"
    | "get"
    | "POST"
    | "post"
    | "PATCH"
    | "DELETE"
    | "delete";

export async function refreshToken(): Promise<string | null> {
    const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!res.ok) {
        if (res.status === 429) {
            addNotification("API", "You are being rate limited", "error");
        }

        return null;
    }

    const body = await res.json();
    return body.accessToken;
}

export async function apiFetch<T>(
    method: FetchMethod,
    endpoint: string,
    body?: any
): Promise<[number, T]> {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            Authorization: accessToken.value
                ? `Bearer ${accessToken.value}`
                : null,
        },
        body,
    });

    if (res.status === 403) {
        const token = await refreshToken();
        console.log(`refreshed access token: ${token}`);
        accessToken.value = token;
        return apiFetch(method, endpoint, body);
    }

    let resBody: any = await res.text();
    if (resBody.length > 0) {
        resBody = JSON.parse(resBody);
    }

    if (!res.ok) {
        throw new Error(resBody.error || "Failed to reach API");
    }

    return [res.status, resBody];
}
