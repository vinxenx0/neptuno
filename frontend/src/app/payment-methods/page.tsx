// src/app/payment-methods/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { motion } from "framer-motion";

interface PaymentMethod {
  id: number;
  type: string;
  last_four: string;
  expiry_date: string;
}

export default function PaymentMethodsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [newMethod, setNewMethod] = useState({ type: "credit_card", number: "", expiry: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchMethods = async () => {
      try {
        const { data, error } = await fetchAPI<PaymentMethod[]>("/v1/payments/methods");
        if (error) throw new Error(error as string);
        setMethods(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar métodos de pago");
      } finally {
        setLoading(false);
      }
    };

    fetchMethods();
  }, [user, router]);

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await fetchAPI<PaymentMethod>("/v1/payments/methods", {
        method: "POST",
        data: {
          type: newMethod.type,
          number: newMethod.number,
          expiry_date: newMethod.expiry,
        },
      });
      if (error) throw new Error(error as string);
      setMethods([...methods, data!]);
      setNewMethod({ type: "credit_card", number: "", expiry: "" });
      setSuccess("Método de pago añadido con éxito");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al añadir método de pago");
    }
  };

  const handleDeleteMethod = async (id: number) => {
    setError(null);
    setSuccess(null);
    try {
      const { error } = await fetchAPI(`/v1/payments/methods/${id}`, { method: "DELETE" });
      if (error) throw new Error(error as string);
      setMethods(methods.filter((m) => m.id !== id));
      setSuccess("Método de pago eliminado con éxito");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar método de pago");
    }
  };

  if (loading) {
    return <div className="text-center p-4">Cargando métodos de pago...</div>;
  }

  return (
    <div className="container p-6 fade-in">
      <h1 className="mb-6 text-center">Métodos de Pago</h1>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-500 text-white rounded-lg"
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-green-500 text-white rounded-lg"
        >
          {success}
        </motion.div>
      )}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {methods.map((method) => (
          <motion.div
            key={method.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-lg shadow-lg hover-grow flex justify-between items-center"
          >
            <div>
              <p className="font-semibold text-[var(--primary)]">
                {method.type === "credit_card" ? "Tarjeta" : method.type}
              </p>
              <p className="text-gray-600">**** **** **** {method.last_four}</p>
              <p className="text-gray-600">Expira: {method.expiry_date}</p>
            </div>
            <button
              onClick={() => handleDeleteMethod(method.id)}
              className="text-red-500 hover:text-red-700 font-semibold"
            >
              Eliminar
            </button>
          </motion.div>
        ))}
      </div>
      <form onSubmit={handleAddMethod} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">Añadir Método de Pago</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Tipo
            </label>
            <select
              id="type"
              value={newMethod.type}
              onChange={(e) => setNewMethod({ ...newMethod, type: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="credit_card">Tarjeta de Crédito</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
          <div>
            <label htmlFor="number" className="block text-sm font-medium text-gray-700">
              Número
            </label>
            <input
              type="text"
              id="number"
              value={newMethod.number}
              onChange={(e) => setNewMethod({ ...newMethod, number: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="1234 5678 9012 3456"
              required
            />
          </div>
          <div>
            <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
              Fecha de Expiración
            </label>
            <input
              type="text"
              id="expiry"
              value={newMethod.expiry}
              onChange={(e) => setNewMethod({ ...newMethod, expiry: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="MM/AA"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full">
            Añadir Método
          </button>
        </div>
      </form>
    </div>
  );
}