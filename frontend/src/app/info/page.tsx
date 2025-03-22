// src/app/info/page.tsx
"use client";

import { useState } from "react";
import fetchAPI from "@/lib/api";

export default function InfoPage() {
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    const { data, error } = await fetchAPI<{ message: string }>("/v1/api/info");
    setResponse(data?.message || null);
    setError(error ? String(error) : null);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Get Info</h1>
      <button
        onClick={handleClick}
        className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
      >
        Probar Endpoint
      </button>
      {response && <p className="mt-4 text-green-600">{response}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}