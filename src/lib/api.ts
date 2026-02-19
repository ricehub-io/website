import { jwtDecode } from "jwt-decode";
import { accessToken, addNotification } from "./appState";
import { HttpStatus } from "./enums";

export const API_URL: string =
    window.__APP_CONFIG__?.API_URL ?? "http://127.0.0.1:3000";

export type FetchMethod = "GET" | "POST" | "PATCH" | "DELETE";

export async function refreshToken(): Promise<string | null> {
    const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (!res.ok) {
        if (res.status === HttpStatus.TooManyRequests) {
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
): Promise<[HttpStatus, T]> {
    // refresh access token if expired
    if (accessToken.value !== null) {
        const { exp } = jwtDecode(accessToken.value);
        const timestampNow = Math.round(Date.now() / 1000);
        if (timestampNow >= exp) {
            // token has expired
            console.log("refreshing access token");
            const token = await refreshToken();
            accessToken.value = token;
        }
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            Authorization: accessToken.value
                ? `Bearer ${accessToken.value}`
                : null,
        },
        body,
    });

    let resBody: any = await res.text();
    if (resBody.length > 0) {
        resBody = JSON.parse(resBody);
    }

    if (!res.ok) {
        const err =
            (resBody.errors !== undefined && resBody.errors[0]) ||
            resBody.error ||
            "Failed to reach API";
        throw new Error(err);
    }

    return [res.status, resBody];
}
