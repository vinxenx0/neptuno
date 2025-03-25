// admin/errors/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";

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

export default function ErrorLogsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      router.push("/user/login");
      return;
    }

    const fetchLogs = async () => {
      try {
        const { data, error } = await fetchAPI<ErrorLog[]>(`/v1/logs?page=${page}&limit=${limit}`);
        if (error) throw new Error(error as string);
        setLogs(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar los logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user, router, page]);

  if (loading) return <div className="text-[var(--foreground)] text-center p-4 text-xl font-semibold">Cargando...</div>;
  if (error) return <div className="text-[var(--foreground)] text-center p-4 text-xl font-semibold">Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Error Logs</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">User ID</th>
            <th className="border p-2">Session ID</th>
            <th className="border p-2">Error Code</th>
            <th className="border p-2">Message</th>
            <th className="border p-2">URL</th>
            <th className="border p-2">Method</th>
            <th className="border p-2">IP Address</th>
            <th className="border p-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
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
      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Anterior
        </button>
        <span>Página {page}</span>
        <button
          onClick={() => setPage((prev) => prev + 1)}
          disabled={logs.length < limit}
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}