"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { motion } from "framer-motion";

// Interfaces de datos
interface ErrorLog {
  id: number;
  user_id?: number;
  session_id?: string;
  error_code: number;
  message: string;
  details?: string;
  url?: string;
  method?: string;
  ip_address?: string;
  created_at: string;
}

interface APILog {
  id: number;
  user_id?: number;
  endpoint: string;
  method: string;
  status_code: number;
  request_data?: string;
  response_data?: string;
  timestamp: string;
}

interface AnonymousSession {
  id: string;
  credits: number;
  create_at: string;
  ultima_actividad?: string;
  last_ip?: string;
}

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

// Componente de pestañas
const TabContent = ({ tab }: { tab: string }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        let endpoint = "";
        switch (tab) {
          case "errors":
            endpoint = `/v1/logs?page=${page}&limit=${limit}`;
            break;
          case "logs":
            endpoint = "/v1/logs";
            break;
          case "sessions":
            endpoint = "/v1/sessions";
            break;
          case "transactions":
            endpoint = "/v1/transactions";
            break;
        }
        const { data, error } = await fetchAPI<any[]>(endpoint);
        if (error) throw new Error(error as string);
        setData(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : `Error al cargar ${tab}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router, tab, page]);

  if (loading) return <div className="text-center p-4"><div className="loading-spinner mx-auto"></div></div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  const renderTable = () => {
    switch (tab) {
      case "errors":
        return (
          <table className="min-w-full bg-[var(--background)] border border-[var(--border)] rounded-lg">
            <thead>
              <tr className="bg-[var(--primary)] text-white">
                <th className="p-3">ID</th>
                <th className="p-3">User ID</th>
                <th className="p-3">Session ID</th>
                <th className="p-3">Error Code</th>
                <th className="p-3">Message</th>
                <th className="p-3">URL</th>
                <th className="p-3">Method</th>
                <th className="p-3">IP Address</th>
                <th className="p-3">Created At</th>
              </tr>
            </thead>
            <tbody>
              {(data as ErrorLog[]).map((log) => (
                <tr key={log.id} className="hover:bg-[var(--accent-hover)] transition-colors">
                  <td className="border p-2">{log.id}</td>
                  <td className="border p-2">{log.user_id ?? "N/A"}</td>
                  <td className="border p-2">{log.session_id ?? "N/A"}</td>
                  <td className="border p-2">{log.error_code}</td>
                  <td className="border p-2">{log.message}</td>
                  <td className="border p-2">{log.url ?? "N/A"}</td>
                  <td className="border p-2">{log.method ?? "N/A"}</td>
                  <td className="border p-2">{log.ip_address ?? "N/A"}</td>
                  <td className="border p-2">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "logs":
        return (
          <table className="min-w-full bg-[var(--background)] border border-[var(--border)] rounded-lg">
            <thead>
              <tr className="bg-[var(--primary)] text-white">
                <th className="p-3">ID</th>
                <th className="p-3">User ID</th>
                <th className="p-3">Endpoint</th>
                <th className="p-3">Method</th>
                <th className="p-3">Status Code</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {(data as APILog[]).map((log) => (
                <tr key={log.id} className="hover:bg-[var(--accent-hover)] transition-colors">
                  <td className="border p-2">{log.id}</td>
                  <td className="border p-2">{log.user_id ?? "N/A"}</td>
                  <td className="border p-2">{log.endpoint}</td>
                  <td className="border p-2">{log.method}</td>
                  <td className="border p-2">{log.status_code}</td>
                  <td className="border p-2">{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "sessions":
        return (
          <table className="min-w-full bg-[var(--background)] border border-[var(--border)] rounded-lg">
            <thead>
              <tr className="bg-[var(--primary)] text-white">
                <th className="p-3">ID</th>
                <th className="p-3">Créditos</th>
                <th className="p-3">Creado</th>
                <th className="p-3">Última Actividad</th>
                <th className="p-3">Última IP</th>
              </tr>
            </thead>
            <tbody>
              {(data as AnonymousSession[]).map((session) => (
                <tr key={session.id} className="hover:bg-[var(--accent-hover)] transition-colors">
                  <td className="border p-2">{session.id}</td>
                  <td className="border p-2">{session.credits}</td>
                  <td className="border p-2">{new Date(session.create_at).toLocaleString()}</td>
                  <td className="border p-2">
                    {session.ultima_actividad ? new Date(session.ultima_actividad).toLocaleString() : "N/A"}
                  </td>
                  <td className="border p-2">{session.last_ip ?? "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case "transactions":
        return (
          <table className="min-w-full bg-[var(--background)] border border-[var(--border)] rounded-lg">
            <thead>
              <tr className="bg-[var(--primary)] text-white">
                <th className="p-3">ID</th>
                <th className="p-3">User ID</th>
                <th className="p-3">Session ID</th>
                <th className="p-3">Cantidad</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Monto Pago</th>
                <th className="p-3">Método Pago</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {(data as CreditTransaction[]).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-[var(--accent-hover)] transition-colors">
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
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto">
      {renderTable()}
      {tab === "errors" && (
        <div className="mt-4 flex justify-between">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50"
          >
            Anterior
          </button>
          <span>Página {page}</span>
          <button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={data.length < limit}
            className="btn-secondary disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default function RegistryPage() {
  const [activeTab, setActiveTab] = useState("errors");

  const tabs = [
    { id: "errors", label: "Error Logs" },
    { id: "logs", label: "API Logs" },
    { id: "sessions", label: "Sesiones" },
    { id: "transactions", label: "Transacciones" },
  ];

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-6 text-center"
      >
        Registro de Administración
      </motion.h1>
      <div className="bg-[var(--background)] rounded-lg shadow-lg p-4">
        <div className="flex border-b border-[var(--border)] mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--accent-hover)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Suspense fallback={<div className="text-center p-4"><div className="loading-spinner mx-auto"></div></div>}>
          <TabContent tab={activeTab} />
        </Suspense>
      </div>
    </div>
  );
}