// src/app/payments/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { motion } from "framer-motion";
import { CreditTransaction } from "@/lib/types";



export default function PaymentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [credits, setCredits] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchTransactions = async () => {
      try {
        const { data, error } = await fetchAPI<CreditTransaction[]>("/v1/payments/transactions");
        if (error) throw new Error(error as string);
        setTransactions(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar transacciones");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, router]);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await fetchAPI<CreditTransaction>("/v1/payments/purchase", {
        method: "POST",
        data: { credits: parseInt(credits), payment_amount: parseFloat(paymentAmount), payment_method: paymentMethod },
      });
      if (error) throw new Error(error as string);
      setTransactions([data!, ...transactions]); // Añadir la nueva transacción al inicio
      setCredits("");
      setPaymentAmount("");
      setSuccess("Créditos comprados con éxito");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al comprar créditos");
    }
  };

  if (loading) return <div className="text-center p-4">Cargando...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Comprar Créditos y Historial de Transacciones</h1>
      {error && (
        <motion.div className="mb-4 p-4 bg-red-500 text-white rounded-lg" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div className="mb-4 p-4 bg-green-500 text-white rounded-lg" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          {success}
        </motion.div>
      )}

      {/* Formulario de compra */}
      <form onSubmit={handlePurchase} className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">Comprar Créditos</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Créditos</label>
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Monto (USD)</label>
            <input
              type="number"
              step="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Método de Pago</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            >
              <option value="stripe">Stripe</option>
              {/* Agrega más opciones si es necesario */}
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">Comprar</button>
        </div>
      </form>

      {/* Historial de transacciones */}
       <h2 className="text-xl font-semibold mb-4 text-[var(--primary)]">Historial de Transacciones</h2>
      <div className="grid grid-cols-1 gap-6">
        {transactions.length === 0 ? (
          <p className="text-center text-gray-600">No hay transacciones registradas.</p>
        ) : (
          transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id ?? `transaction-${index}`} // 👈 Fallback si el ID es nulo o indefinido
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-4 rounded-lg shadow-lg"
            >
              <p className="font-semibold text-blue-600">
                {transaction.transaction_type === "purchase"
                  ? "Compra"
                  : transaction.transaction_type === "usage"
                  ? "Uso"
                  : "Reinicio"}{" "}
                de {Math.abs(transaction.amount)} créditos
              </p>
              {transaction.payment_amount && (
                <p className="text-gray-600">Monto: ${transaction.payment_amount.toFixed(2)}</p>
              )}
              {transaction.payment_method && (
                <p className="text-gray-600">Método: {transaction.payment_method}</p>
              )}
              {transaction.payment_status && (
                <p className="text-gray-600">Estado: {transaction.payment_status}</p>
              )}
              <p className="text-gray-500 text-sm">
                Fecha: {new Date(transaction.timestamp).toLocaleString()}
              </p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}