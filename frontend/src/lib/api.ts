// src/lib/api.ts
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { HTTPValidationError, RegisterRequest, TokenResponse, UpdateProfileRequest, User, ValidationError } from "./types";

interface FetchResponse<T> {
  data: T | null;
  error: string | HTTPValidationError | null;
}

const logRequest = (method: string, url: string, status: number, data?: unknown) => {
  console.log(`[${method}] ${url} - Status: ${status}`, data ?? "");
};

const fetchAPI = async <T>(
  endpoint: string,
  options: AxiosRequestConfig = {},
  contentType: string = "application/json"
): Promise<FetchResponse<T>> => {
  console.log(`Iniciando fetchAPI para ${endpoint}`);
  const token = localStorage.getItem("accessToken");
  const headers = {
    "Content-Type": contentType,
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  let data = options.data;
  if (contentType === "application/x-www-form-urlencoded" && data) {
    const formData = new URLSearchParams();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) formData.append(key, String(value));
    });
    data = formData;
  }

  const config: AxiosRequestConfig = {
    ...options,
    url: `${process.env.NEXT_PUBLIC_API_URL}${endpoint}`,
    headers,
    data,
  };

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
    const response: AxiosResponse<T> = await axios(config);
    logRequest(config.method || "GET", config.url!, response.status, response.data);
    return normalizeResponse(response, null);
  } catch (err: unknown) {
    const axiosError = err as AxiosError;
    logRequest(
      config.method || "GET",
      config.url!,
      axiosError.response?.status || 500,
      axiosError.response?.data
    );

    if (axiosError.response?.status === 401) {
      const refresh = localStorage.getItem("refreshToken");
      if (refresh) {
        try {
          console.log("Intentando refrescar token");
          const refreshResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh`,
            new URLSearchParams({ refresh_token: refresh }).toString(),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
          );
          const newToken = refreshResponse.data.access_token;
          localStorage.setItem("accessToken", newToken);
          config.headers = { ...config.headers, Authorization: `Bearer ${newToken}` };
          const retryResponse: AxiosResponse<T> = await axios(config);
          logRequest(config.method || "GET", config.url!, retryResponse.status, retryResponse.data);
          return normalizeResponse(retryResponse, null);
        } catch (refreshErr: unknown) {
          console.error("Error al refrescar token:", refreshErr);
          return normalizeResponse(undefined, { message: "Sesión expirada, por favor inicia sesión nuevamente" });
        }
      }
    }

    return normalizeResponse(undefined, err);
  }
};

// Obtener la lista de usuarios (ya debería estar implementado o similar)
export const getAllUsers = async (): Promise<FetchResponse<User[]>> => {
  return fetchAPI<User[]>("/v1/users/admin/users", { method: "GET" });
};

// Obtener un usuario específico por ID
export const getUserById = async (userId: number): Promise<FetchResponse<User>> => {
  return fetchAPI<User>(`/v1/users/${userId}`, { method: "GET" });
};

// Actualizar un usuario por ID
export const updateUser = async (
  userId: number,
  data: UpdateProfileRequest
): Promise<FetchResponse<User>> => {
  return fetchAPI<User>(`/v1/users/${userId}`, { method: "PUT", data });
};

// Eliminar un usuario por ID
export const deleteUser = async (userId: number): Promise<FetchResponse<void>> => {
  return fetchAPI<void>(`/v1/users/${userId}`, { method: "DELETE" });
};

// Crear un nuevo usuario (usando el endpoint de registro)
export const createUser = async (data: RegisterRequest): Promise<FetchResponse<TokenResponse>> => {
  return fetchAPI<TokenResponse>("/v1/auth/register", { method: "POST", data });
};

export default fetchAPI;
