"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";

interface AnonymousSession {
  id: string;
  credits: number;
  create_at: string;
  ultima_actividad?: string;
  last_ip?: string;
}

export default function AnonymousSessionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<AnonymousSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      router.push("/login");
      return;
    }

    const fetchSessions = async () => {
      try {
        const { data, error } = await fetchAPI<AnonymousSession[]>("/v1/sessions");
        if (error) throw new Error(error as string);
        setSessions(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar las sesiones");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user, router]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Sesiones Anónimas</h1>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Créditos</th>
            <th className="border p-2">Creado</th>
            <th className="border p-2">Última Actividad</th>
            <th className="border p-2">Última IP</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id}>
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
    </div>
  );
}