import axios, { type AxiosRequestConfig } from "axios";

export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

export class ApiError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type ApiRequestConfig = Omit<AxiosRequestConfig, "baseURL" | "data" | "method" | "url">;

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");

if (!configuredBaseUrl) {
  throw new Error("VITE_API_BASE_URL 환경변수가 설정되지 않았습니다.");
}

export const apiBaseUrl = configuredBaseUrl;

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  config.withCredentials = true;
  config.headers.set("Accept", "application/json");
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const status = error.response?.status ?? 0;
    const data = error.response?.data ?? error;
    const serverMessage = getServerErrorMessage(error.response?.data);
    const message = serverMessage
      ?? (status === 0
        ? "API 서버에 연결할 수 없습니다. API 주소와 HTTPS 설정을 확인해 주세요."
        : `요청에 실패했습니다. (${status})`);

    const apiError = new ApiError(message, status, data);
    if (status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
    }

    return Promise.reject(apiError);
  },
);

export const http = {
  get<T>(path: string, config?: ApiRequestConfig) {
    return apiClient.get<T, T>(path, config);
  },

  post<T, TBody = unknown>(path: string, body?: TBody, config?: ApiRequestConfig) {
    return apiClient.post<T, T, TBody>(path, body, config);
  },
};

export function getApiErrorStatus(error: unknown) {
  if (error instanceof ApiError) return error.status;
  if (typeof error !== "object" || error === null || !("status" in error)) return null;
  const status = (error as { status: unknown }).status;
  return typeof status === "number" ? status : null;
}

function getServerErrorMessage(data: unknown) {
  if (typeof data !== "object" || data === null || !("error" in data)) return null;
  return String((data as { error: unknown }).error);
}
