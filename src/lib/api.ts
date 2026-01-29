import { accessToken } from "./appState";

const API_URL = "http://localhost:3000";

type FetchMethod = "get" | "post" | "delete";

async function refreshToken(): Promise<string> {
    const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    const data = await res.json();
    // TODO: check for error

    return data.accessToken;
}

export async function apiFetch<T>(
    method: FetchMethod,
    endpoint: string,
): Promise<[number, T]> {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: accessToken.value ?? null,
        },
    });

    // check for expired token
    if (res.status === 403) {
        const accessToken = await refreshToken();
        console.log(accessToken);
        // return apiFetch(method, endpoint);
        return;
    }

    const resBody = await res.json();
    if (!res.ok) {
        throw new Error(resBody.error || "Failed to reach API");
    }

    return [res.status, resBody];
}
