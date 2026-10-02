import axios from "axios";

export const api = axios.create({
    baseURL: "/api",
    headers: { Accept: "application/json" },
});

export function getApiError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const responseError = error.response?.data?.error;
        return typeof responseError === "string" ? responseError : error.message;
    }
    return error instanceof Error ? error.message : "Request failed";
}
