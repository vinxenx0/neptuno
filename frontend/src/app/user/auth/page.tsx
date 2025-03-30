// src/app/user/auth/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RegisterRequest } from "@/lib/types";
import fetchAPI from "@/lib/api";

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [enableRegistration, setEnableRegistration] = useState(true);
  const { login, register } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const enableRegistrationRes = await fetchAPI("/v1/settings/enable_registration");
        setEnableRegistration(enableRegistrationRes.data === "true" || enableRegistrationRes.data === true);
      } catch (err) {
        console.error("Error al obtener configuraciones:", err);
        setEnableRegistration(true);
      }
    };
    fetchSettings();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await login(email, password);
      setSuccess("¡Inicio de sesión exitoso! Redirigiendo...");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!enableRegistration) return;
    try {
      const data: RegisterRequest = { email, username, password };
      await register(data);
      setSuccess("¡Registro exitoso! Redirigiendo...");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al registrarse";
      if (errorMessage.includes("email")) {
        setError("El email ya está registrado");
      } else if (errorMessage.includes("username")) {
        setError("El nombre de usuario ya está en uso");
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await fetchAPI<{ message: string; token?: string }>("/v1/auth/password-reset", {
        method: "POST",
        data: { email },
      });
      if (error) throw new Error(error as string);
      setSuccess(data?.message || "Solicitud enviada, revisa tu correo.");
      setToken(data?.token || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al solicitar recuperación");
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await fetchAPI<{ message: string }>("/v1/auth/password-reset/confirm", {
        method: "POST",
        data: { token, new_password: newPassword },
      });
      if (error) throw new Error(error as string);
      setSuccess(data?.message || "Contraseña actualizada con éxito.");
      setTimeout(() => setMode("login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar contraseña");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg"
    >
      <AnimatePresence mode="wait">
        {mode === "login" && (
          <motion.div
            key="login"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="mb-6 text-center text-2xl font-bold">Iniciar Sesión</h1>
            {error && <p className="mb-4 p-3 bg-red-500 text-white rounded-md text-center">{error}</p>}
            {success && <p className="mb-4 p-3 bg-green-500 text-white rounded-md text-center">{success}</p>}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  required
                />
              </div>
              <button type="submit" className="btn-primary w-full">
                Iniciar Sesión
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              {enableRegistration ? (
                <button onClick={() => setMode("register")} className="text-[var(--secondary)] hover:underline">
                  Regístrate
                </button>
              ) : (
                <span className="text-gray-500">Registro deshabilitado</span>
              )}
            </p>
            <p className="mt-4 text-center text-sm text-gray-600">
              ¿Olvidaste tu contraseña?{" "}
              <button onClick={() => setMode("reset")} className="text-[var(--secondary)] hover:underline">
                Recupérala aquí
              </button>
            </p>
          </motion.div>
        )}
        {mode === "register" && (
          <motion.div
            key="register"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="mb-6 text-center text-2xl font-bold">Registrarse</h1>
            {!enableRegistration && (
              <p className="mb-4 p-3 bg-yellow-500 text-white rounded-md text-center">
                El registro está deshabilitado en este momento.
              </p>
            )}
            {error && <p className="mb-4 p-3 bg-red-500 text-white rounded-md text-center">{error}</p>}
            {success && <p className="mb-4 p-3 bg-green-500 text-white rounded-md text-center">{success}</p>}
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:bg-gray-200"
                  required
                  disabled={!enableRegistration}
                />
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:bg-gray-200"
                  required
                  disabled={!enableRegistration}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] disabled:bg-gray-200"
                  required
                  disabled={!enableRegistration}
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!enableRegistration}
              >
                Registrarse
              </button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{" "}
              <button onClick={() => setMode("login")} className="text-[var(--secondary)] hover:underline">
                Inicia sesión
              </button>
            </p>
          </motion.div>
        )}
        {mode === "reset" && (
          <motion.div
            key="reset"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="mb-6 text-center text-2xl font-bold">Recuperar Contraseña</h1>
            {error && <p className="mb-4 p-3 bg-red-500 text-white rounded-md text-center">{error}</p>}
            {success && <p className="mb-4 p-3 bg-green-500 text-white rounded-md text-center">{success}</p>}
            {!success ? (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Solicitar Recuperación
                </button>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-6">
                <div>
                  <label htmlFor="token" className="block text-sm font-medium text-gray-700">
                    Token
                  </label>
                  <input
                    type="text"
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Actualizar Contraseña
                </button>
              </form>
            )}
            <p className="mt-4 text-center text-sm text-gray-600">
              <button onClick={() => setMode("login")} className="text-[var(--secondary)] hover:underline">
                Volver a Iniciar Sesión
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}