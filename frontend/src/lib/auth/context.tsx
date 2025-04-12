// src/lib/auth/context.tsx
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { User, TokenResponse, RegisterRequest, UserInfo, Gamification, Badge, Coupon } from "../types";
import { motion } from "framer-motion";
import { GamificationEventCreate, GamificationEventResponse, UserGamificationResponse } from "../types";

interface AuthContextType {
  user: User | null;
  credits: number;
  gamification: Gamification | null; // Añadimos gamificación al contexto
  coupons: Coupon[];
  setCredits: (credits: number) => void; // Añadido
  setCoupons: (coupons: Coupon[]) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setGamification: (gamification: Gamification) => void; // Añadido
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
  const [credits, setCredits] = useState<number>(10); // Valor por defecto para anónimos
  const [gamification, setGamification] = useState<Gamification | null>(null); // Estado para gamificación
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);


  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await fetchAPI<any>("/info"); // Endpoint para obtener info del usuario
        if (data) {
          if (data.user_type === "registered") {
            setUser({
              id: parseInt(data.user_id!),
              email: data.email!,
              username: data.username!,
              rol: data.rol!,
              activo: true,
              subscription: data.subscription!,
              credits: data.credits,
              create_at: "",
              last_ip: "",
              last_login: "",
              user_type: data.user_type,
            });
            setCredits(data.credits);
          } else if (data.user_type === "anonymous") {
            setUser(null);
            setCredits(data.credits);
            localStorage.setItem("session_id", data.session_id!);
          } else {
            setUser(null);
            setCredits(0);
          }

          // Obtener datos de gamificación
          const gamificationRes = await fetchAPI<any[]>("/v1/gamification/me");
          if (gamificationRes.data) {
            const totalPoints = gamificationRes.data.reduce((sum, g) => sum + g.points, 0);
            const badges = gamificationRes.data.map(g => g.badge).filter(Boolean) as Badge[];
            setGamification({ points: totalPoints, badges });
          } else {
            setGamification({ points: 0, badges: [] });
          }

          // Obtener cupones del usuario
          const couponsRes = await fetchAPI<Coupon[]>("/v1/coupons/me");
          setCoupons(couponsRes.data || []);
        }
      } catch (err) {
        console.error("Error en checkAuth:", err);
        setUser(null);
        setCredits(0);
        setGamification({ points: 0, badges: [] });
        setCoupons([]);
      } finally {
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
    localStorage.removeItem("session_id");  // Limpiar session_id al iniciar sesión
    const userResponse = await fetchAPI<User>("/v1/users/me");
    if (userResponse.data) {
      setUser(userResponse.data);
      setCredits(userResponse.data.credits);
      router.push("/user/dashboard");
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
    localStorage.removeItem("session_id");  // Limpiar session_id al cerrar sesión
    setUser(null);
    // const anonCredits = localStorage.getItem("anonCredits");
    // setCredits(anonCredits ? parseInt(anonCredits) : 100);
    router.push("/");
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

  const refreshToken = async (): Promise<string | null> => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) {
      await logout();
      return null;
    }

    try {
      const { data, error } = await fetchAPI<TokenResponse>("/v1/auth/refresh", {
        method: "POST",
        data: { refresh_token: refresh },
        ...(true && { _retry: true }) // Evitar bucle infinito
      });

      if (error || !data) {
        throw new Error(typeof error === "string" ? error : JSON.stringify(error) || "Refresh failed");
      }

      // Actualizar localStorage ANTES de cualquier otra operación
      localStorage.setItem("accessToken", data.access_token);
      localStorage.setItem("refreshToken", data.refresh_token);

      // Actualizar estado del usuario
      const userResponse = await fetchAPI<User>("/v1/users/me");
      if (userResponse.data) {
        setUser(userResponse.data);
        setCredits(userResponse.data.credits);
      }

      return data.access_token;
    } catch (err) {
      console.error("Refresh error:", err);
      await logout();
      return null;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await fetchAPI<User>("/v1/users/me", {
        method: "PUT",
        data,
      });
      if (response.error) throw new Error(typeof response.error === "string" ? response.error : JSON.stringify(response.error));
      if (response.data) {
        setUser(response.data);
        setCredits(response.data.credits);
      } else {
        throw new Error("No se recibió la información del usuario actualizado");
      }
    } catch (err) {
      console.error("Error al actualizar el perfil:", err);
      throw err;
    }
  };

  const deleteProfile = async () => {
    const { error } = await fetchAPI("/v1/users/me", { method: "DELETE" });
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
      value={{ user, credits, gamification, coupons, setCoupons, setGamification, setCredits, login, logout, register, loginWithGoogle, refreshToken, updateProfile, deleteProfile, resetPassword }}
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