// src/app/payments/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import fetchAPI from "@/lib/api";
import { PurchaseRequest, PurchaseResponse } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function PaymentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<PurchaseRequest>({ credits: 0, payment_amount: 0 });
  const [error, setError] = useState("");

  if (!user) {
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await fetchAPI<PurchaseResponse>("/v1/payments/v1/payments/purchase", {
        method: "POST",
        data: form,
      });
      if (error) throw new Error(typeof error === "string" ? error : "Error al comprar créditos");
      alert(`Compra exitosa! Créditos añadidos: ${data!.credits_added}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Comprar Créditos</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="number"
              value={form.credits}
              onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
              placeholder="Cantidad de créditos"
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <input
              type="number"
              value={form.payment_amount}
              onChange={(e) => setForm({ ...form, payment_amount: Number(e.target.value) })}
              placeholder="Monto a pagar"
              className="w-full p-2 border rounded"
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Comprar
          </button>
        </form>
      </div>
    </div>
  );
}