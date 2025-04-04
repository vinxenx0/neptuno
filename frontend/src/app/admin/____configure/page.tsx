// src/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import {
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { AddCircle, Delete, ExpandMore } from "@mui/icons-material";
import { SiteSetting, Integration } from "@/lib/types";

export default function ConfigurePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [settingsByTag, setSettingsByTag] = useState<Record<string, SiteSetting[]>>({});
  const [origins, setOrigins] = useState<string[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [newOrigin, setNewOrigin] = useState("");
  const [newIntegration, setNewIntegration] = useState({ name: "", webhook_url: "", event_type: "" });
  const [features, setFeatures] = useState({
    enable_registration: true,
    enable_social_login: true,
    disable_anonymous_users: false,
    disable_credits: false,
    enable_payment_methods: true,
    enable_gamification: true,
  });
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
        const settingsRes = await fetchAPI<SiteSetting[]>("/v1/settings/admin/config");
        const grouped = settingsRes.data?.reduce((acc, setting) => {
          const tag = setting.tag || "General";
          if (!acc[tag]) acc[tag] = [];
          acc[tag].push(setting);
          return acc;
        }, {} as Record<string, SiteSetting[]>);
        setSettingsByTag(grouped || {});

        const originsRes = await fetchAPI<string[]>("/v1/settings/allowed-origins");
        setOrigins(originsRes.data || []);

        const integrationsRes = await fetchAPI<Integration[]>("/v1/integrations/");
        setIntegrations(integrationsRes.data || []);

        // Cargar el estado inicial de las funcionalidades
        const featuresRes = await Promise.all([
          fetchAPI("/v1/settings/enable_registration"),
          fetchAPI("/v1/settings/enable_social_login"),
          fetchAPI("/v1/settings/disable_anonymous_users"),
          fetchAPI("/v1/settings/disable_credits"),
          fetchAPI("/v1/settings/enable_payment_methods"),
          fetchAPI("/v1/settings/enable_gamification"),
        ]);
        setFeatures({
          enable_registration: featuresRes[0].data === "true",
          enable_social_login: featuresRes[1].data === "true",
          disable_anonymous_users: featuresRes[2].data === "true",
          disable_credits: featuresRes[3].data === "true",
          enable_payment_methods: featuresRes[4].data === "true",
          enable_gamification: featuresRes[5].data === "true",
        });
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
      await fetchAPI("/v1/settings/admin/config", {
        method: "POST",
        data: { key, value: newValue },
      });
      setSettingsByTag((prev) => {
        const updated = { ...prev };
        for (const tag in updated) {
          updated[tag] = updated[tag].map((s) => (s.key === key ? { ...s, value: newValue } : s));
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
      await fetchAPI("/v1/settings/allowed-origins", {
        method: "POST",
        data: { origin: newOrigin },
      });
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
      const { data } = await fetchAPI<Integration>("/v1/integrations/", {
        method: "POST",
        data: {
          name: newIntegration.name,
          webhook_url: newIntegration.webhook_url,
          event_type: newIntegration.event_type,
        },
      });
      setIntegrations([...integrations, data!]);
      setNewIntegration({ name: "", webhook_url: "", event_type: "" });
      setSuccess("Integración creada con éxito");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear integración");
    }
  };

  const handleToggleFeature = async (feature: string, enabled: boolean) => {
    try {
      await fetchAPI("/v1/settings/admin/config", {
        method: "POST",
        data: { key: feature, value: enabled.toString() },
      });
      setFeatures((prev) => ({ ...prev, [feature]: enabled }));
      setSuccess(`Funcionalidad ${enabled ? "activada" : "desactivada"} con éxito`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar funcionalidad");
    }
  };

  if (loading) return <div className="text-center p-4 text-xl">Cargando Dashboard...</div>;

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-center mb-8"
      >
        Dashboard de Administración
      </motion.h1>

      <AnimatePresence>
        {error && (
          <Snackbar open autoHideDuration={3000} onClose={() => setError(null)}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Snackbar>
        )}
        {success && (
          <Snackbar open autoHideDuration={3000} onClose={() => setSuccess(null)}>
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          </Snackbar>
        )}
      </AnimatePresence>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} centered>
        <Tab label="Configuraciones" />
        <Tab label="Orígenes Permitidos" />
        <Tab label="Integraciones" />
        <Tab label="Funcionalidades" />
      </Tabs>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-6"
      >
        {activeTab === 0 && (
          <div className="space-y-4">
            {Object.entries(settingsByTag).map(([tag, settings]) => (
              <Accordion key={tag}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">{tag}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settings.map((setting) => (
                      <TextField
                        key={setting.key}
                        label={setting.key}
                        defaultValue={setting.value}
                        onBlur={(e) => handleSaveSetting(setting.key, e.target.value)}
                        fullWidth
                        variant="outlined"
                        helperText={setting.description}
                      />
                    ))}
                  </div>
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        )}

        {activeTab === 1 && (
          <div className="space-y-4">
            <Card>
              <CardContent>
                <form onSubmit={handleAddOrigin} className="flex space-x-4">
                  <TextField
                    label="Nuevo Origen"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    fullWidth
                    variant="outlined"
                    placeholder="https://example.com"
                  />
                  <Button type="submit" variant="contained" color="primary">
                    Añadir
                  </Button>
                </form>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {origins.map((origin, index) => (
                <Card key={index}>
                  <CardContent className="flex justify-between items-center">
                    <Typography>{origin}</Typography>
                    <IconButton color="error">
                      <Delete />
                    </IconButton>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 2 && (
          <div className="space-y-4">
            <Card>
              <CardContent>
                <form onSubmit={handleAddIntegration} className="space-y-4">
                  <TextField
                    label="Nombre"
                    value={newIntegration.name}
                    onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                    fullWidth
                    variant="outlined"
                  />
                  <TextField
                    label="Webhook URL"
                    value={newIntegration.webhook_url}
                    onChange={(e) => setNewIntegration({ ...newIntegration, webhook_url: e.target.value })}
                    fullWidth
                    variant="outlined"
                  />
                  <TextField
                    label="Tipo de Evento"
                    value={newIntegration.event_type}
                    onChange={(e) => setNewIntegration({ ...newIntegration, event_type: e.target.value })}
                    fullWidth
                    variant="outlined"
                  />
                  <Button type="submit" variant="contained" color="primary" fullWidth>
                    Crear Integración
                  </Button>
                </form>
              </CardContent>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map((integration) => (
                <Card key={integration.id}>
                  <CardContent>
                    <Typography variant="h6">{integration.name}</Typography>
                    <Typography>Webhook: {integration.webhook_url}</Typography>
                    <Typography>Evento: {integration.event_type}</Typography>
                    <Typography>Activo: {integration.active ? "Sí" : "No"}</Typography>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

{activeTab === 3 && (
        <div className="space-y-4">
          <Card>
            <CardContent>
              <Typography variant="h6" className="mb-4">Control de Funcionalidades</Typography>
              <div className="space-y-4">
                <FormControlLabel
                  control={<Switch checked={features.enable_registration} onChange={(e) => handleToggleFeature("enable_registration", e.target.checked)} color="primary" />}
                  label="Habilitar Registro"
                />
                <FormControlLabel
                  control={<Switch checked={features.enable_social_login} onChange={(e) => handleToggleFeature("enable_social_login", e.target.checked)} color="primary" />}
                  label="Habilitar Login Social"
                />
                <FormControlLabel
                  control={<Switch checked={features.disable_anonymous_users} onChange={(e) => handleToggleFeature("disable_anonymous_users", e.target.checked)} color="primary" />}
                  label="Deshabilitar Usuarios Anónimos"
                />
                <FormControlLabel
                  control={<Switch checked={features.disable_credits} onChange={(e) => handleToggleFeature("disable_credits", e.target.checked)} color="primary" />}
                  label="Desactivar Créditos"
                />
                <FormControlLabel
                  control={<Switch checked={features.enable_payment_methods} onChange={(e) => handleToggleFeature("enable_payment_methods", e.target.checked)} color="primary" />}
                  label="Habilitar Medios de Pago"
                />
                <FormControlLabel
                  control={<Switch checked={features.enable_gamification} onChange={(e) => handleToggleFeature("enable_gamification", e.target.checked)} color="primary" />}
                  label="Habilitar Gamificación"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </motion.div>
    </div>
  );
}