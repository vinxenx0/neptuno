// src/app/register/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { RegisterRequest } from "@/lib/types";

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterRequest>({
    email: "",
    username: "",
    password: "",
    ciudad: "",
    url: "",
  });
  const [error, setError] = useState("");
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Registrarse</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Nombre de usuario"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Contraseña"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              name="ciudad"
              value={form.ciudad}
              onChange={handleChange}
              placeholder="Ciudad (opcional)"
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <input
              type="text"
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder="URL (opcional)"
              className="w-full p-2 border rounded"
            />
          </div>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Registrarse
          </button>
        </form>
      </div>
    </div>
  );
}