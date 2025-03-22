// src/app/configure/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { motion } from "framer-motion";

interface SiteSetting {
  key: string;
  value: string | number | object | boolean | string[];
  description?: string;
}

interface Integration {
  id: number;
  name: string;
  webhook_url: string;
  event_type: string;
  active: boolean;
  created_at: string;
  last_triggered: string | null;
}

export default function ConfigurePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"settings" | "origins" | "integrations">("settings");
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [origins, setOrigins] = useState<string[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [newOrigin, setNewOrigin] = useState("");
  const [newIntegration, setNewIntegration] = useState({ name: "", webhook_url: "", event_type: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch SiteSettings
        const settingsRes = await fetchAPI<Record<string, any>>("/v1/settings/admin/config");
        if (settingsRes.error) throw new Error(settingsRes.error as string);
        const settingsArray = Object.entries(settingsRes.data || {}).map(([key, value]) => ({
          key,
          value,
          description: "", // Ajustar si el backend devuelve description
        }));
        setSettings(settingsArray);

        // Fetch Allowed Origins
        const originsRes = await fetchAPI<string[]>("/v1/settings/allowed_origins");
        if (originsRes.error) throw new Error(originsRes.error as string);
        setOrigins(originsRes.data || []);

        // Fetch Integrations
        const integrationsRes = await fetchAPI<Integration[]>("/v1/integrations/");
        if (integrationsRes.error) throw new Error(integrationsRes.error as string);
        setIntegrations(integrationsRes.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  const handleSaveSetting = async (key: string, newValue: string) => {
    try {
      const { error } = await fetchAPI("/v1/settings/admin/config", {
        method: "POST",
        data: { key, value: newValue, description: "" },
      });
      if (error) throw new Error(error as string);
      setSettings((prev) =>
        prev.map((s) => (s.key === key ? { ...s, value: newValue } : s))
      );
      setSuccess("Configuración actualizada");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar configuración");
    }
  };

  const handleAddOrigin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await fetchAPI("/v1/settings/allowed-origins", {
        method: "POST",
        data: { origin: newOrigin },
      });
      if (error) throw new Error(error as string);
      setOrigins([...origins, newOrigin]);
      setNewOrigin("");
      setSuccess("Origen añadido con éxito");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al añadir origen");
    }
  };

  const handleAddIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await fetchAPI<Integration>("/v1/integrations/", {
        method: "POST",
        data: {
          name: newIntegration.name,
          webhook_url: newIntegration.webhook_url,
          event_type: newIntegration.event_type,
        },
      });
      if (error) throw new Error(error as string);
      setIntegrations([...integrations, data!]);
      setNewIntegration({ name: "", webhook_url: "", event_type: "" });
      setSuccess("Integración creada con éxito");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear integración");
    }
  };

  if (loading) return <div className="text-center p-4">Cargando datos de administración...</div>;

  return (
    <div className="container p-6 fade-in">
      <h1 className="mb-6 text-center">Dashboard de Administración</h1>
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

      {/* Pestañas */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("settings")}
          className={`nav-link ${activeTab === "settings" ? "bg-[var(--accent)]" : "bg-gray-200 text-gray-700"}`}
        >
          Configuraciones
        </button>
        <button
          onClick={() => setActiveTab("origins")}
          className={`nav-link ${activeTab === "origins" ? "bg-[var(--accent)]" : "bg-gray-200 text-gray-700"}`}
        >
          Orígenes Permitidos
        </button>
        <button
          onClick={() => setActiveTab("integrations")}
          className={`nav-link ${activeTab === "integrations" ? "bg-[var(--accent)]" : "bg-gray-200 text-gray-700"}`}
        >
          Integraciones
        </button>
      </div>

      {/* Contenido */}
      <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 gap-6">
        {activeTab === "settings" && (
          settings.length === 0 ? (
            <p className="text-center text-gray-600">No hay configuraciones disponibles.</p>
          ) : (
            settings.map((setting) => (
              <div key={setting.key} className="bg-white p-4 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-[var(--primary)]">{setting.key}</h2>
                <p className="text-gray-600">{setting.description || "Sin descripción"}</p>
                <input
                  type="text"
                  value={typeof setting.value === "string" ? setting.value : JSON.stringify(setting.value)}
                  onChange={(e) => handleSaveSetting(setting.key, e.target.value)}
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                />
              </div>
            ))
          )
        )}

        {activeTab === "origins" && (
          <>
            <form onSubmit={handleAddOrigin} className="mb-6 bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-[var(--primary)] mb-4">Añadir Origen</h2>
              <input
                type="text"
                value={newOrigin}
                onChange={(e) => setNewOrigin(e.target.value)}
                placeholder="https://example.com"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                required
              />
              <button type="submit" className="btn-primary mt-4 w-full">Añadir</button>
            </form>
            {origins.length === 0 ? (
              <p className="text-center text-gray-600">No hay orígenes permitidos.</p>
            ) : (
              origins.map((origin, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-lg hover-grow">
                  <p className="text-gray-600">{origin}</p>
                </div>
              ))
            )}
          </>
        )}

        {activeTab === "integrations" && (
          <>
            <form onSubmit={handleAddIntegration} className="mb-6 bg-white p-4 rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold text-[var(--primary)] mb-4">Crear Integración</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newIntegration.name}
                  onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                  placeholder="Nombre"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  required
                />
                <input
                  type="text"
                  value={newIntegration.webhook_url}
                  onChange={(e) => setNewIntegration({ ...newIntegration, webhook_url: e.target.value })}
                  placeholder="Webhook URL"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  required
                />
                <input
                  type="text"
                  value={newIntegration.event_type}
                  onChange={(e) => setNewIntegration({ ...newIntegration, event_type: e.target.value })}
                  placeholder="Tipo de Evento"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  required
                />
                <button type="submit" className="btn-primary w-full">Crear</button>
              </div>
            </form>
            {integrations.length === 0 ? (
              <p className="text-center text-gray-600">No hay integraciones.</p>
            ) : (
              integrations.map((integration) => (
                <div key={integration.id} className="bg-white p-4 rounded-lg shadow-lg hover-grow">
                  <p className="font-semibold text-[var(--primary)]">{integration.name}</p>
                  <p className="text-gray-600">Webhook: {integration.webhook_url}</p>
                  <p className="text-gray-600">Evento: {integration.event_type}</p>
                  <p className="text-gray-600">Activo: {integration.active ? "Sí" : "No"}</p>
                  <p className="text-gray-600">Creado: {new Date(integration.created_at).toLocaleString()}</p>
                  <p className="text-gray-600">Último disparo: {integration.last_triggered ? new Date(integration.last_triggered).toLocaleString() : "Nunca"}</p>
                </div>
              ))
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}