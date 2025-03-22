// src/app/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import { User } from "@/lib/types";

export default function ProfilePage() {
  const { user, logout, updateProfile, deleteProfile, resetPassword } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<Partial<User>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) router.push("/login");
    else setForm({ email: user.email, username: user.username, ciudad: user.ciudad, url: user.url });
  }, [user, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      setError("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de eliminar tu cuenta?")) {
      try {
        await deleteProfile();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword(user!.email);
      alert("Se ha enviado un enlace para restablecer tu contraseña");
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Perfil</h1>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <input
              type="email"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Email"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <input
              type="text"
              value={form.username || ""}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Usuario"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <input
              type="text"
              value={form.ciudad || ""}
              onChange={(e) => setForm({ ...form, ciudad: e.target.value })}
              placeholder="Ciudad"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <input
              type="text"
              value={form.url || ""}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="URL"
              className="w-full p-2 border rounded"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Actualizar Perfil
          </button>
        </form>
        <button
          onClick={handleResetPassword}
          className="w-full mt-4 bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
        >
          Restablecer Contraseña
        </button>
        <button
          onClick={logout}
          className="w-full mt-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Cerrar Sesión
        </button>
        <button
          onClick={handleDelete}
          className="w-full mt-4 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
        >
          Eliminar Cuenta
        </button>
      </div>
    </div>
  );
}