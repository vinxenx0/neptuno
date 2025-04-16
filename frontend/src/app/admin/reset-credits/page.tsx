// src/app/reset-credits/page.tsx
// Página de reseteo de créditos para administradores

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";

export default function ResetCreditsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.user_type !== "registered") router.push("/user/auth/#login");
  }, [user, router]);

  const handleClick = async () => {
    const { data, error } = await fetchAPI<{ message: string }>("/v1/test/reset-credits", {
      method: "POST",
    });
    setResponse(data?.message || null);
    setError(error ? String(error) : null);
  };

  if (!user || user.user_type !== "registered") return null;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Reset Credits</h1>
      <button
        onClick={handleClick}
        className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Reiniciar Créditos
      </button>
      {response && <p className="mt-4 text-green-600">{response}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}