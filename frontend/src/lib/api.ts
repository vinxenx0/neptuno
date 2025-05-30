// frontend/src/lib/api.ts
// Cliente Axios y funciones para consumir la API

// src/lib/api.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, AxiosInstance } from "axios";
import { useState, useEffect } from 'react';
import { HTTPValidationError, FetchResponse, RegisterRequest, TokenResponse, UpdateProfileRequest, User, ValidationError } from "./types";

// Extender AxiosRequestConfig para incluir _retry
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Crear una instancia personalizada de Axios
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Variables para manejar el estado de refresco
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Agregar el interceptor de solicitudes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  const sessionId = localStorage.getItem("session_id");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  } else if (sessionId) {
    config.headers["X-Session-ID"] = sessionId;
  }
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
    url: endpoint, // baseURL ya está configurado en la instancia
    headers: {
      "Content-Type": contentType,
      ...options.headers,
    },
    data: options.data,
  };

  // Convertir datos a formato x-www-form-urlencoded si es necesario
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
        if (typeof errorData.detail === "string") {
          return { data: null, error: errorData.detail };
        } else if (Array.isArray(errorData.detail)) {
          const messages = errorData.detail
            .map((err: ValidationError) => err.msg)
            .join(", ");
          return { data: null, error: messages };
        }
      }
    }

    return { data: null, error: "Error desconocido" };
  };

  try {
    const response: AxiosResponse<T> = await api(config); // Usar la instancia 'api'
    logRequest(config.method || "GET", config.url!, response.status, response.data);

    if (response.data && (response.data as any).redirect_url) {
      window.location.href = (response.data as any).redirect_url;
      return { data: null, error: "Redirecting..." };
    }

    if (response.data && (response.data as any).session_id) {
      localStorage.setItem("session_id", (response.data as any).session_id);
    }

    return normalizeResponse(response, null);
  } catch (err: unknown) {
    const axiosError = err as AxiosError;
    logRequest(
      config.method || "GET",
      config.url!,
      axiosError.response?.status || 500,
      axiosError.response?.data
    );

    if (axiosError.response?.status === 401 && !config._retry) {
      const originalRequest: CustomAxiosRequestConfig = config;
      originalRequest._retry = true;

      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken && refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({
              resolve: (token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                api(originalRequest)
                  .then(response => resolve(normalizeResponse(response, null)))
                  .catch(error => reject(normalizeResponse(undefined, error)));
              },
              reject: (error) => reject(normalizeResponse(undefined, error)),
            });
          });
        }

        isRefreshing = true;

        try {
          console.log("Intentando refrescar token de acceso");
          const refreshResponse = await api.post<TokenResponse>(
            "/v1/auth/refresh",
            { refresh_token: refreshToken },
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
              },
            }
          );

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
          localStorage.removeItem("session_id");
          processQueue(refreshError, null);
          window.location.href = "/user/auth/#login";
          return normalizeResponse(undefined, {
            message: "Sesión expirada, por favor inicia sesión nuevamente",
          });
        } finally {
          isRefreshing = false;
        }
      } else {
        return normalizeResponse(undefined, { message: "No autorizado" });
      }
    }

    return normalizeResponse(undefined, err);
  }
};

// Custom hook to fetch data
export const useFetchData = <T>(
  endpoint: string,
  options: CustomAxiosRequestConfig = {},
  dependencies: any[] = []
): { data: T | null; loading: boolean; error: string | null } => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchAPI<T>(endpoint, options);
        if (response.error) {
          setError(typeof response.error === 'string' ? response.error : 'Error desconocido');
        } else {
          setData(response.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, options, dependencies]); // Asegurar que la lista de dependencias sea un array literal y agregar endpoint y options como dependencias

  return { data, loading, error };
};

// Funciones específicas de la API
export const getAllUsers = async (
  page: number = 1,
  limit: number = 10
): Promise<FetchResponse<{
  data: User[],
  total_items: number,
  total_pages: number,
  current_page: number
}>> => {
  return fetchAPI(`/v1/users/admin/users?page=${page}&limit=${limit}`, {
    method: "GET"
  });
};

export const getUserById = async (
  userId: number
): Promise<FetchResponse<User>> => {
  return fetchAPI<User>(`/v1/users/${userId}`, {
    method: "GET"
  });
};

export const updateUser = async (
  userId: number,
  data: UpdateProfileRequest
): Promise<FetchResponse<User>> => {
  return fetchAPI<User>(`/v1/users/${userId}`, {
    method: "PUT",
    data
  });
};

export const deleteUser = async (
  userId: number
): Promise<FetchResponse<void>> => {
  return fetchAPI<void>(`/v1/users/${userId}`, {
    method: "DELETE"
  });
};

export const createUser = async (
  data: RegisterRequest
): Promise<FetchResponse<TokenResponse>> => {
  return fetchAPI<TokenResponse>("/v1/auth/register", {
    method: "POST",
    data
  });
};

export default fetchAPI;