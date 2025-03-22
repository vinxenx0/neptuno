// src/lib/auth/context.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { User, TokenResponse, RegisterRequest } from "../types";
import { motion } from "framer-motion";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  loginWithGoogle: () => void;
  refreshToken: () => Promise<string | null>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  deleteProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("Montando AuthProvider");
    const checkAuth = async () => {
      try {
        console.log("Iniciando checkAuth...");
        const token = localStorage.getItem("accessToken");
        if (!token) {
          console.log("No hay token, saltando checkAuth");
          return;
        }
        console.log("Token encontrado, llamando a /v1/auth/me");
        const { data, error } = await fetchAPI<User>("/v1/auth/me");
        console.log("Respuesta de /v1/auth/me:", { data, error });
        if (data) {
          setUser(data);
        } else {
          console.log("No se obtuvo usuario, limpiando tokens");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setUser(null);
        }
      } catch (err) {
        console.error("Error en checkAuth:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
      } finally {
        console.log("checkAuth completado");
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await fetchAPI<TokenResponse>(
      "/v1/auth/token",
      {
        method: "POST",
        data: { username: email, password, grant_type: "password" },
      },
      "application/x-www-form-urlencoded"
    );
    if (error) throw new Error(typeof error === "string" ? error : "Error al iniciar sesión");
    localStorage.setItem("accessToken", data!.access_token);
    localStorage.setItem("refreshToken", data!.refresh_token);
    const userResponse = await fetchAPI<User>("/v1/auth/me");
    if (userResponse.data) {
      setUser(userResponse.data);
      router.push("/profile");
    }
  };

  const logout = async () => {
    try {
      await fetchAPI("/v1/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    router.push("/login");
  };

  const register = async (data: RegisterRequest) => {
    const { error } = await fetchAPI("/v1/auth/register", {
      method: "POST",
      data,
    });
    if (error) throw new Error(typeof error === "string" ? error : "Error al registrarse");
    await login(data.email, data.password);
  };

  const loginWithGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login/google`;
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) return null;
    const { data, error } = await fetchAPI<TokenResponse>(
      "/v1/auth/refresh",
      {
        method: "POST",
        data: { refresh_token: refresh },
      },
      "application/x-www-form-urlencoded"
    );
    if (error || !data) {
      logout();
      return null;
    }
    localStorage.setItem("accessToken", data.access_token);
    return data.access_token;
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await fetchAPI<User>("/v1/auth/me", {
        method: "PUT",
        data,
      });
      if (response.error) throw new Error(typeof response.error === "string" ? response.error : JSON.stringify(response.error));
      if (response.data) {
        setUser(response.data); // Actualiza el estado con el usuario completo
      } else {
        throw new Error("No se recibió la información del usuario actualizado");
      }
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);
      throw err;
    }
  };
  
  
  const deleteProfile = async () => {
    const { error } = await fetchAPI("/v1/auth/me", { method: "DELETE" });
    if (error) throw new Error(typeof error === "string" ? error : "Error al eliminar perfil");
    logout();
  };

  const resetPassword = async (email: string) => {
    const { error } = await fetchAPI("/v1/auth/password-reset", {
      method: "POST",
      data: { email },
    });
    if (error) throw new Error(typeof error === "string" ? error : "Error al restablecer contraseña");
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 flex items-center justify-center bg-[var(--background)] z-50"
      >
        <div className="text-[var(--foreground)] text-xl font-semibold">
          Cargando Neptuno...
        </div>
      </motion.div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, loginWithGoogle, refreshToken, updateProfile, deleteProfile, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};