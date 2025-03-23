// src/app/configure/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { motion } from "framer-motion";
import { SiteSetting, Integration } from "@/lib/types";

export default function ConfigurePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"settings" | "origins" | "integrations">("settings");
  const [settingsByTag, setSettingsByTag] = useState<Record<string, SiteSetting[]>>({});
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
        const settingsRes = await fetchAPI<SiteSetting[]>("/v1/settings/admin/config");
        if (settingsRes.error) throw new Error(settingsRes.error as string);
        const settings = settingsRes.data || [];
        const grouped = settings.reduce((acc, setting) => {
          const tag = setting.tag || "General";
          if (!acc[tag]) acc[tag] = [];
          acc[tag].push(setting);
          return acc;
        }, {} as Record<string, SiteSetting[]>);
        setSettingsByTag(grouped);

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
        data: { key, value: newValue },
      });
      if (error) throw new Error(error as string);
      setSettingsByTag((prev) => {
        const updated = { ...prev };
        for (const tag in updated) {
          updated[tag] = updated[tag].map((s) =>
            s.key === key ? { ...s, value: newValue } : s
          );
        }
        return updated;
      });
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

  if (loading) return <div className="text-center p-4 text-xl">Cargando Dashboard...</div>;

  return (
    <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-[var(--primary)] mb-8">
        Dashboard de Administración
      </h1>
      {error && (
        <motion.div
          className="mb-6 p-4 bg-red-500 text-white rounded-lg shadow-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          className="mb-6 p-4 bg-green-500 text-white rounded-lg shadow-md"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {success}
        </motion.div>
      )}

      {/* Pestañas */}
      <div className="flex justify-center space-x-4 mb-8">
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === "settings"
              ? "bg-[var(--primary)] text-white"
              : "bg-white text-gray-700 hover:bg-gray-200"
          }`}
        >
          Configuraciones
        </button>
        <button
          onClick={() => setActiveTab("origins")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === "origins"
              ? "bg-[var(--primary)] text-white"
              : "bg-white text-gray-700 hover:bg-gray-200"
          }`}
        >
          Orígenes Permitidos
        </button>
        <button
          onClick={() => setActiveTab("integrations")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all ${
            activeTab === "integrations"
              ? "bg-[var(--primary)] text-white"
              : "bg-white text-gray-700 hover:bg-gray-200"
          }`}
        >
          Integraciones
        </button>
      </div>

      {/* Contenido */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {activeTab === "settings" && (
          <div className="space-y-8">
            {Object.entries(settingsByTag).map(([tag, settings]) => (
              <div key={tag} className="bg-white p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-[var(--accent)] mb-4 capitalize">
                  {tag}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {settings.map((setting) => (
                    <div key={setting.key} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {setting.key}
                      </label>
                      <p className="text-gray-500 text-sm">{setting.description}</p>
                      <input
                        type="text"
                        defaultValue={setting.value}
                        onBlur={(e) => handleSaveSetting(setting.key, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "origins" && (
          <div className="space-y-6">
            <form onSubmit={handleAddOrigin} className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">
                Añadir Origen
              </h2>
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
                <button type="submit" className="btn-primary px-6 py-2">
                  Añadir
                </button>
              </div>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {origins.map((origin, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  {origin}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="space-y-6">
            <form onSubmit={handleAddIntegration} className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-[var(--primary)] mb-4">
                Nueva Integración
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={newIntegration.name}
                  onChange={(e) =>
                    setNewIntegration({ ...newIntegration, name: e.target.value })
                  }
                  placeholder="Nombre"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
                <input
                  type="text"
                  value={newIntegration.webhook_url}
                  onChange={(e) =>
                    setNewIntegration({ ...newIntegration, webhook_url: e.target.value })
                  }
                  placeholder="Webhook URL"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
                <input
                  type="text"
                  value={newIntegration.event_type}
                  onChange={(e) =>
                    setNewIntegration({ ...newIntegration, event_type: e.target.value })
                  }
                  placeholder="Tipo de Evento"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
              </div>
              <button type="submit" className="btn-primary mt-4 w-full">
                Crear
              </button>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration) => (
                <div
                  key={integration.id}
                  className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <h3 className="font-semibold text-[var(--primary)]">{integration.name}</h3>
                  <p className="text-gray-600">Webhook: {integration.webhook_url}</p>
                  <p className="text-gray-600">Evento: {integration.event_type}</p>
                  <p className="text-gray-600">Activo: {integration.active ? "Sí" : "No"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}