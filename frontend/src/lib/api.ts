import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { HTTPValidationError, FetchResponse, RegisterRequest, TokenResponse, UpdateProfileRequest, User, ValidationError } from "./types";

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
  const sessionId = localStorage.getItem("session_id");  // Leer session_id de localStorage
  const headers = {
    "Content-Type": contentType,
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(sessionId && { "X-Session-ID": sessionId }),  // Incluir X-Session-ID si existe
    ...options.headers,
  };

  // Convertir datos a formato x-www-form-urlencoded si es necesario
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

    // Si la respuesta incluye session_id, almacenarlo en localStorage
    if (response.data && response.data.session_id) {
      localStorage.setItem("session_id", response.data.session_id);
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

    // Manejar error 401 (No autorizado)
    if (axiosError.response?.status === 401 && !config._retry) {
      const originalRequest = config;
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("session_id");  // Limpiar session_id también
        window.location.href = "/user/login";
        return normalizeResponse(undefined, { message: "Sesión expirada" });
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              axios(originalRequest)
                .then(response => resolve(normalizeResponse(response, null)))
                .catch(error => reject(normalizeResponse(undefined, error)));
            },
            reject: (error: any) => {
              reject(normalizeResponse(undefined, error));
            }
          });
        });
      }

      isRefreshing = true;

      try {
        console.log("Intentando refrescar token de acceso");
        const refreshResponse = await axios.post<TokenResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            }
          }
        );

        localStorage.setItem("accessToken", refreshResponse.data.access_token);
        localStorage.setItem("refreshToken", refreshResponse.data.refresh_token);
        localStorage.removeItem("session_id");  // Limpiar session_id al refrescar token

        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access_token}`;
        processQueue(null, refreshResponse.data.access_token);

        const retryResponse = await axios(originalRequest);
        return normalizeResponse(retryResponse, null);
      } catch (refreshError) {
        console.error("Error al refrescar token:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("session_id");  // Limpiar session_id también
        processQueue(refreshError, null);
        window.location.href = "/user/login";
        return normalizeResponse(undefined, {
          message: "Sesión expirada, por favor inicia sesión nuevamente"
        });
      } finally {
        isRefreshing = false;
      }
    }

    return normalizeResponse(undefined, err);
  }
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