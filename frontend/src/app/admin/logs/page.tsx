// admin/logs/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";

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

export default function APILogsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<APILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      router.push("/login");
      return;
    }

    const fetchLogs = async () => {
      try {
        const { data, error } = await fetchAPI<APILog[]>("/v1/logs");
        if (error) throw new Error(error as string);
        setLogs(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar los logs");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user, router]);

  if (loading) return <div className="text-[var(--foreground)] text-center p-4 text-xl font-semibold">Cargando...</div>;
  if (error) return <div className="text-[var(--foreground)] text-center p-4 text-xl font-semibold">Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">API Logs</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">User ID</th>
            <th className="border p-2">Endpoint</th>
            <th className="border p-2">Method</th>
            <th className="border p-2">Status Code</th>
            <th className="border p-2">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
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
    </div>
  );
}