// src/app/change-password
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import fetchAPI from "@/lib/api";

export default function ProfilePage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await fetchAPI<{ message: string }>("/v1/auth/me/password", {
        method: "PUT",
        data: { current_password: currentPassword, new_password: newPassword },
      });
      if (error) throw new Error(error as string);
      setSuccess(data?.message || "Contraseña actualizada");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar contraseña");
    }
  };

  if (!user) return <div className="text-[var(--foreground)] text-center p-4 text-xl font-semibold">Cargando...</div>;

  return (
    <div className="container p-6 fade-in">
      <h1 className="mb-6 text-center">Perfil de Usuario</h1>
      <form onSubmit={handleChangePassword} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg space-y-4">
        <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">Cambiar Contraseña</h2>
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
            Contraseña Actual
          </label>
          <input
            type="password"
            id="currentPassword"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            required
          />
        </div>
        <button type="submit" className="btn-primary w-full">Cambiar Contraseña</button>
      </form>
      {error && <p className="mt-4 p-3 bg-red-500 text-white rounded-md text-center">{error}</p>}
      {success && <p className="mt-4 p-3 bg-green-500 text-white rounded-md text-center">{success}</p>}
    </div>
  );
}