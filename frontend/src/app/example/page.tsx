// src/app/example/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";

export default function ExamplePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [response, setResponse] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  const handleClick = async () => {
    const { data, error } = await fetchAPI<{ message: string; credits_remaining: number }>(
      "/v1/api/example"
    );
    if (data) {
      setResponse(data.message);
      setCredits(data.credits_remaining);
    }
    setError(error ? String(error) : null);
  };

  if (!user) return null;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Example Endpoint</h1>
      <button
        onClick={handleClick}
        className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Probar Endpoint
      </button>
      {response && <p className="mt-4 text-green-600">{response}</p>}
      {credits !== null && <p className="mt-2">Créditos restantes: {credits}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}