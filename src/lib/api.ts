import { accessToken, addNotification } from "./appState";

export const API_URL = "http://127.0.0.1:3000";

type FetchMethod = "GET" | "POST" | "PATCH" | "DELETE";

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

    const data = await res.json();
    return data.accessToken;
}

export async function apiFetch<T>(
    method: FetchMethod,
    endpoint: string,
    body?: any,
): Promise<[number, T]> {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: accessToken.value ? `Bearer ${accessToken.value}` : null,
        },
        body,
    });

    // check for expired token
    // if (res.status === 403) {
    //     const token = await refreshToken();
    //     console.log("updated access token");
    //     accessToken.value = token;
    //     return apiFetch(method, endpoint, body);
    // }

    let resBody: any = await res.text();
    if (resBody.length > 0) {
        resBody = JSON.parse(resBody);
    }

    if (!res.ok) {
        throw new Error(resBody.error || "Failed to reach API");
    }

    return [res.status, resBody];
}
