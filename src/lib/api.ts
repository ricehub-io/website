import { jwtDecode } from "jwt-decode";
import { accessToken, addNotification } from "./appState";
import { HttpStatus } from "./enums";

export const API_URL: string =
    window.__APP_CONFIG__?.API_URL ?? "http://127.0.0.1:3000";

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
    // I think it's better to decode access token before sending request
    // and check if it's expired on client instead of waiting for 403 from API
    // because then we can't differentiate between 403 from expired token vs
    // 403 because user can't access the resource causing request loop
    const { exp } = jwtDecode(accessToken.value);
    const timestampNow = Math.round(Date.now() / 1000);
    if (timestampNow >= exp) {
        // token has expired
        console.log("refreshing access token");
        const token = await refreshToken();
        accessToken.value = token;
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
        throw new Error(resBody.error || "Failed to reach API");
    }

    return [res.status, resBody];
}
