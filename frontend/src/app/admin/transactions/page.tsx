// admin/transactions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";

interface CreditTransaction {
  id: number;
  user_id?: number;
  session_id?: string;
  amount: number;
  transaction_type: string;
  payment_amount?: number;
  payment_method?: string;
  payment_status: string;
  timestamp: string;
}

export default function CreditTransactionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      router.push("/user/login");
      return;
    }

    const fetchTransactions = async () => {
      try {
        const { data, error } = await fetchAPI<CreditTransaction[]>("/v1/transactions");
        if (error) throw new Error(error as string);
        setTransactions(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar las transacciones");
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [user, router]);

  if (loading) return <div className="text-[var(--foreground)] text-center p-4 text-xl font-semibold">Cargando...</div>;
  if (error) return <div className="text-[var(--foreground)] text-center p-4 text-xl font-semibold">Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Transacciones de Créditos</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">User ID</th>
            <th className="border p-2">Session ID</th>
            <th className="border p-2">Cantidad</th>
            <th className="border p-2">Tipo</th>
            <th className="border p-2">Monto Pago</th>
            <th className="border p-2">Método Pago</th>
            <th className="border p-2">Estado</th>
            <th className="border p-2">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="border p-2">{transaction.id}</td>
              <td className="border p-2">{transaction.user_id ?? "N/A"}</td>
              <td className="border p-2">{transaction.session_id ?? "N/A"}</td>
              <td className="border p-2">{transaction.amount}</td>
              <td className="border p-2">{transaction.transaction_type}</td>
              <td className="border p-2">{transaction.payment_amount?.toFixed(2) ?? "N/A"}</td>
              <td className="border p-2">{transaction.payment_method ?? "N/A"}</td>
              <td className="border p-2">{transaction.payment_status}</td>
              <td className="border p-2">{new Date(transaction.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}