import { accessToken, addNotification } from "@/lib/appState";
import { HttpStatus, isStatusOk } from "@/lib/enums";
import { jwtDecode } from "jwt-decode";
import * as z from "zod";

export const API_URL: string =
    window.__APP_CONFIG__?.API_URL ?? "http://127.0.0.1:3000";

export type FetchMethod = "GET" | "POST" | "PATCH" | "DELETE";

export class ApiError extends Error {
    public readonly statusCode: HttpStatus;

    constructor(message: string, statusCode: HttpStatus) {
        super(message);
        this.name = "ApiError";
        this.statusCode = statusCode;

        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

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

async function checkTokenExpired() {
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
}

async function sendRequest(
    method: FetchMethod,
    endpoint: string,
    body?: any,
    withoutToken?: boolean
): Promise<[HttpStatus, any]> {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            ...(accessToken.value &&
                !withoutToken && {
                    Authorization: `Bearer ${accessToken.value}`,
                }),
        },
        credentials: withoutToken ? "include" : "same-origin",
        body,
    });
    const resBody = await res.json().catch(() => null);
    return [res.status, resBody];
}

/** API Fetch function for Zod schemas */
export async function apiFetchV2<T extends z.ZodType>(
    method: FetchMethod,
    endpoint: string,
    reqBody?: string | FormData,
    schema?: T,
    withoutToken?: boolean
): Promise<[HttpStatus, z.infer<T>]> {
    if (!withoutToken) {
        await checkTokenExpired();
    }

    const [status, resBody] = await sendRequest(
        method,
        endpoint,
        reqBody,
        withoutToken
    );
    if (!isStatusOk(status)) {
        const err =
            resBody?.errors?.[0] || resBody?.error || "Failed to reach API";

        throw new ApiError(err, status);
    }

    const parsedBody = schema?.parse(resBody) ?? null;
    return [status, parsedBody];
}
