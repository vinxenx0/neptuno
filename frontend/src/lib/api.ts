// frontend/src/lib/api.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, AxiosInstance } from "axios";
import { FetchResponse, RegisterRequest, TokenResponse, UpdateProfileRequest, User } from "./types";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("user_id");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  if (userId) config.headers["X-User-ID"] = userId;
  return config;
});

const logRequest = (method: string, url: string, status: number, data?: unknown) => {
  console.log(`[${method}] ${url} - Status: ${status}`, data ?? "");
};

const fetchAPI = async <T>(
  endpoint: string,
  options: CustomAxiosRequestConfig = {},
  contentType: string = "application/json"
): Promise<FetchResponse<T>> => {
  console.log(`Iniciando fetchAPI para ${endpoint}`);

  const config: CustomAxiosRequestConfig = {
    ...options,
    url: endpoint,
    headers: { "Content-Type": contentType, ...options.headers },
    data: options.data,
  };

  if (contentType === "application/x-www-form-urlencoded" && config.data) {
    const formData = new URLSearchParams();
    Object.entries(config.data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });
    config.data = formData;
  }

  const normalizeResponse = (
    response: AxiosResponse<T> | undefined,
    error: unknown
  ): FetchResponse<T> => {
    if (response && response.status >= 200 && response.status < 300) {
      return { data: response.data, error: null };
    }
    if (axios.isAxiosError(error)) {
      const errorData = error.response?.data;
      if (errorData && errorData.detail) {
        return { data: null, error: typeof errorData.detail === "string" ? errorData.detail : "Error desconocido" };
      }
    }
    return { data: null, error: "Error desconocido" };
  };

  try {
    const response: AxiosResponse<T> = await api(config);
    logRequest(config.method || "GET", config.url!, response.status, response.data);
    if (response.headers["x-user-id"]) localStorage.setItem("user_id", response.headers["x-user-id"]);
    return normalizeResponse(response, null);
  } catch (err: unknown) {
    const axiosError = err as AxiosError;
    logRequest(config.method || "GET", config.url!, axiosError.response?.status || 500, axiosError.response?.data);

    if (axiosError.response?.status === 401 && !config._retry) {
      const originalRequest: CustomAxiosRequestConfig = { ...config, _retry: true };
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                api(originalRequest).then(res => resolve(normalizeResponse(res, null))).catch(e => reject(normalizeResponse(undefined, e)));
              },
              reject: (error) => reject(normalizeResponse(undefined, error)),
            });
          });
        }

        isRefreshing = true;
        try {
          const refreshResponse = await api.post<TokenResponse>("/v1/auth/refresh", { refresh_token: refreshToken });
          localStorage.setItem("accessToken", refreshResponse.data.access_token);
          localStorage.setItem("refreshToken", refreshResponse.data.refresh_token);
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
          processQueue(null, refreshResponse.data.access_token);
          const retryResponse = await api(originalRequest);
          return normalizeResponse(retryResponse, null);
        } catch (refreshError) {
          console.error("Error al refrescar token:", refreshError);
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user_id");
          processQueue(refreshError, null);
          window.location.href = "/user/auth/#login";
          return normalizeResponse(undefined, { message: "Sesión expirada" });
        } finally {
          isRefreshing = false;
        }
      }
    }
    return normalizeResponse(undefined, err);
  }
};

export const getAllUsers = async (page: number = 1, limit: number = 10): Promise<FetchResponse<any>> => {
  return fetchAPI(`/v1/users/admin/users?page=${page}&limit=${limit}`, { method: "GET" });
};

export const getUserById = async (userId: number): Promise<FetchResponse<User>> => {
  return fetchAPI<User>(`/v1/users/${userId}`, { method: "GET" });
};

export const updateUser = async (userId: number, data: UpdateProfileRequest): Promise<FetchResponse<User>> => {
  return fetchAPI<User>(`/v1/users/${userId}`, { method: "PUT", data });
};

export const deleteUser = async (userId: number): Promise<FetchResponse<void>> => {
  return fetchAPI<void>(`/v1/users/${userId}`, { method: "DELETE" });
};

export const createUser = async (data: RegisterRequest): Promise<FetchResponse<TokenResponse>> => {
  return fetchAPI<TokenResponse>("/v1/auth/register", { method: "POST", data });
};

export default fetchAPI;