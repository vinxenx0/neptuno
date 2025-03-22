"use client";

import { useState } from "react";
import fetchAPI from "@/lib/api";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);  // 1: solicitar, 2: confirmar
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await fetchAPI<{ message: string; token?: string }>("/v1/auth/password-reset", {
        method: "POST",
        data: { email },
      });
      if (error) throw new Error(error as string);
      setSuccess(data?.message || "Solicitud enviada");
      setToken(data?.token || "");  // Temporal para pruebas
      setStep(2);
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
      setSuccess(data?.message || "Contraseña actualizada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar contraseña");
    }
  };

  return (
    <div className="container p-6 fade-in min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg"
      >
        <h1 className="mb-6 text-center">Recuperar Contraseña</h1>
        {error && <p className="mb-4 p-3 bg-red-500 text-white rounded-md text-center">{error}</p>}
        {success && <p className="mb-4 p-3 bg-green-500 text-white rounded-md text-center">{success}</p>}
        {step === 1 ? (
          <form onSubmit={handleRequestReset} className="space-y-6">
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
      </motion.div>
    </div>
  );
}