// src/app/payment-methods/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { motion } from "framer-motion";

// Interfaz para los métodos de pago, ajustada al backend
interface PaymentMethod {
  id: number;
  payment_type: string; // Usamos 'payment_type' en lugar de 'type'
  details: string;
  is_default: boolean;
}

export default function PaymentMethodsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [newMethod, setNewMethod] = useState({ payment_type: "stripe", details: "", is_default: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Cargar métodos de pago al iniciar
  useEffect(() => {
    if (!user) {
      router.push("/user/login");
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

  // Añadir un nuevo método de pago
  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await fetchAPI<PaymentMethod>("/v1/payments/methods", {
        method: "POST",
        data: {
          payment_type: newMethod.payment_type,
          details: newMethod.details,
          is_default: newMethod.is_default,
        },
      });
      if (error) throw new Error(error as string);
      setMethods([...methods, data!]);
      setNewMethod({ payment_type: "stripe", details: "", is_default: false });
      setSuccess("Método de pago añadido con éxito");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al añadir método de pago");
    }
  };

  // Establecer un método como predeterminado
  const handleSetDefault = async (methodId: number) => {
    setError(null);
    setSuccess(null);
    try {
      const { error } = await fetchAPI(`/v1/payments/methods/${methodId}/default`, {
        method: "PUT",
      });
      if (error) throw new Error(error as string);
      setMethods(methods.map((m) => ({ ...m, is_default: m.id === methodId })));
      setSuccess("Método establecido como predeterminado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al establecer método predeterminado");
    }
  };

  if (loading) return <div className="text-[var(--foreground)] text-center p-4 text-xl font-semibold">Cargando métodos de pago...</div>;

  return (
    <div className="container p-6 fade-in">
      <h1 className="mb-6 text-center">Métodos de Pago</h1>
      {error && (
        <motion.div
          className="mb-4 p-4 bg-red-500 text-white rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          className="mb-4 p-4 bg-green-500 text-white rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {success}
        </motion.div>
      )}
      <div className="grid grid-cols-1 gap-6 mb-8">
        {methods.length === 0 ? (
          <p className="text-center text-gray-600">No hay métodos de pago registrados.</p>
        ) : (
          methods.map((method) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-4 rounded-lg shadow-lg hover-grow flex justify-between items-center"
            >
              <div>
                <p className="font-semibold text-[var(--primary)]">{method.payment_type}</p>
                <p className="text-gray-600">{method.details}</p>
                {method.is_default && <p className="text-green-600">Predeterminado</p>}
              </div>
              {!method.is_default && (
                <button
                  onClick={() => handleSetDefault(method.id)}
                  className="text-[var(--secondary)] hover:underline"
                >
                  Hacer Predeterminado
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>
      <form onSubmit={handleAddMethod} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">Añadir Método de Pago</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="payment_type" className="block text-sm font-medium text-gray-700">
              Tipo
            </label>
            <select
              id="payment_type"
              value={newMethod.payment_type}
              onChange={(e) => setNewMethod({ ...newMethod, payment_type: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="stripe">Stripe</option>
              {/* Añade más opciones según lo que soporte tu backend */}
            </select>
          </div>
          <div>
            <label htmlFor="details" className="block text-sm font-medium text-gray-700">
              Detalles
            </label>
            <input
              type="text"
              id="details"
              value={newMethod.details}
              onChange={(e) => setNewMethod({ ...newMethod, details: e.target.value })}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              placeholder="Ej: **** **** **** 1234"
              required
            />
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={newMethod.is_default}
                onChange={(e) => setNewMethod({ ...newMethod, is_default: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">Establecer como predeterminado</span>
            </label>
          </div>
          <button type="submit" className="btn-primary w-full">Añadir Método</button>
        </div>
      </form>
    </div>
  );
}