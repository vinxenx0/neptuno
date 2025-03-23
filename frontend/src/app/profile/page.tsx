// src/app/profile/page.tsx
// src/app/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import Link from "next/link"; // Añadido para el enlace
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ email: "", username: "", ciudad: "", website: "" });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      setFormData({
        email: user.email || "",
        username: user.username || "",
        ciudad: user.ciudad || "",
        website: user.website || "",
      });
    }
  }, [user, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await updateProfile(formData);
      setSuccess("Perfil actualizado con éxito");
      setEditMode(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar perfil");
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      await logout();
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cerrar sesión");
    }
  };

  if (!user) return null;

  return (
    <div className="container p-6 fade-in min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full bg-white p-8 rounded-lg shadow-lg"
      >
        <h1 className="mb-6 text-center">Perfil de {user.username}</h1>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-red-500 text-white rounded-md text-center"
          >
            {error}
          </motion.p>
        )}
        {success && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 bg-green-500 text-white rounded-md text-center"
          >
            {success}
          </motion.p>
        )}
        {editMode ? (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ciudad</label>
              <input
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">WEBSITE</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <button type="submit" className="btn-primary w-full">Guardar</button>
            <button type="button" onClick={() => setEditMode(false)} className="btn-disabled w-full mt-2">Cancelar</button>
            <Link href="/change-password" className="btn-primary w-full mt-2 inline-block text-center">Cambiar Contraseña</Link>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="font-semibold text-[var(--primary)]">Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[var(--primary)]">Username:</span>
              <span>{user.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[var(--primary)]">Ciudad:</span>
              <span>{user.ciudad || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[var(--primary)]">website:</span>
              <span>{user.website || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[var(--primary)]">Rol:</span>
              <span className="capitalize">{user.rol}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[var(--primary)]">subscription:</span>
              <span>{user.subscription || "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[var(--primary)]">Consultas restantes:</span>
              <span>{user.credits ?? "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[var(--primary)]">Fecha de creación:</span>
              <span>{user.create_at ? new Date(user.create_at).toLocaleDateString() : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-[var(--primary)]">Último inicio de sesión:</span>
              <span>{user.last_login ? new Date(user.last_login).toLocaleString() : "N/A"}</span>
            </div>
            <button onClick={() => setEditMode(true)} className="btn-primary w-full mt-4">Editar Perfil</button>
            <button onClick={handleLogout} className="btn-primary w-full mt-2">Cerrar Sesión</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}