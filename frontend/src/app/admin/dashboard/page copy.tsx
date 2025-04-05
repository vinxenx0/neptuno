// src/app/admin/dashboard/page.tsx
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
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { AddCircle, Delete, ExpandMore, Edit } from "@mui/icons-material";
import { SiteSetting, Integration, EventType, Badge, PaymentProvider } from "@/lib/types";

export default function AdminDashboard() {
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
    enable_points: true,
    enable_badges: true,
  });
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>([]);
  const [editEventType, setEditEventType] = useState<EventType | null>(null);
  const [editBadge, setEditBadge] = useState<Badge | null>(null);
  const [editPaymentProvider, setEditPaymentProvider] = useState<PaymentProvider | null>(null);
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

        const eventTypesRes = await fetchAPI<EventType[]>("/v1/gamification/event-types");
        setEventTypes(eventTypesRes.data || []);

        const badgesRes = await fetchAPI<Badge[]>("/v1/gamification/badges");
        setBadges(badgesRes.data || []);

        const paymentProvidersRes = await fetchAPI<PaymentProvider[]>("/v1/payment-providers");
        setPaymentProviders(paymentProvidersRes.data || []);

        const featuresRes = await Promise.all([
          fetchAPI("/v1/settings/enable_registration"),
          fetchAPI("/v1/settings/enable_social_login"),
          fetchAPI("/v1/settings/disable_anonymous_users"),
          fetchAPI("/v1/settings/disable_credits"),
          fetchAPI("/v1/settings/enable_payment_methods"),
          fetchAPI("/v1/settings/enable_points"),
          fetchAPI("/v1/settings/enable_badges"),
        ]);
        setFeatures({
          enable_registration: featuresRes[0].data === "true",
          enable_social_login: featuresRes[1].data === "true",
          disable_anonymous_users: featuresRes[2].data === "true",
          disable_credits: featuresRes[3].data === "true",
          enable_payment_methods: featuresRes[4].data === "true",
          enable_points: featuresRes[5].data === "true",
          enable_badges: featuresRes[6].data === "true",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, router]);

  const groupedBadges = badges.reduce((acc, badge) => {
    const key = badge.event_type_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(badge);
    return acc;
  }, {} as Record<number, Badge[]>);

  const handleSaveSetting = async (key: string, newValue: string) => {
    try {
      await fetchAPI("/v1/settings/admin/config", { method: "POST", data: { key, value: newValue } });
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
      await fetchAPI("/v1/settings/allowed-origins", { method: "POST", data: { origin: newOrigin } });
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
        data: { name: newIntegration.name, webhook_url: newIntegration.webhook_url, event_type: newIntegration.event_type },
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
      await fetchAPI("/v1/settings/admin/config", { method: "POST", data: { key: feature, value: enabled.toString() } });
      setFeatures((prev) => ({ ...prev, [feature]: enabled }));
      setSuccess(`Funcionalidad ${enabled ? "activada" : "desactivada"} con éxito`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar funcionalidad");
    }
  };

  const handleCreateEventType = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await fetchAPI<EventType>("/v1/gamification/event-types", { method: "POST", data: editEventType });
      setEventTypes([...eventTypes, data!]);
      setEditEventType(null);
      setSuccess("Tipo de evento creado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear tipo de evento");
    }
  };

  const handleUpdateEventType = async (e: React.FormEvent) => {
    if (!editEventType?.id) return;
    try {
      const { data } = await fetchAPI<EventType>(`/v1/gamification/event-types/${editEventType.id}`, { method: "PUT", data: editEventType });
      setEventTypes(eventTypes.map((et) => (et.id === data!.id ? data! : et)));
      setEditEventType(null);
      setSuccess("Tipo de evento actualizado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar tipo de evento");
    }
  };

  const handleDeleteEventType = async (id: number) => {
    try {
      await fetchAPI(`/v1/gamification/event-types/${id}`, { method: "DELETE" });
      setEventTypes(eventTypes.filter((et) => et.id !== id));
      setSuccess("Tipo de evento eliminado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar tipo de evento");
    }
  };

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await fetchAPI<Badge>("/v1/gamification/badges", { method: "POST", data: editBadge });
      setBadges([...badges, data!]);
      setEditBadge(null);
      setSuccess("Badge creado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear badge");
    }
  };

  const handleUpdateBadge = async (e: React.FormEvent) => {
    if (!editBadge?.id) return;
    try {
      const { data } = await fetchAPI<Badge>(`/v1/gamification/badges/${editBadge.id}`, { method: "PUT", data: editBadge });
      setBadges(badges.map((b) => (b.id === data!.id ? data! : b)));
      setEditBadge(null);
      setSuccess("Badge actualizado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar badge");
    }
  };

  const handleDeleteBadge = async (id: number) => {
    try {
      await fetchAPI(`/v1/gamification/badges/${id}`, { method: "DELETE" });
      setBadges(badges.filter((b) => b.id !== id));
      setSuccess("Badge eliminado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar badge");
    }
  };

  const handleTogglePaymentProvider = async (id: number, active: boolean) => {
    try {
      const { data } = await fetchAPI<PaymentProvider>(`/v1/payment-providers/${id}`, {
        method: "PUT",
        data: { active },
      });
      setPaymentProviders(paymentProviders.map((p) => (p.id === id ? data! : p)));
      setSuccess(`Proveedor ${active ? "activado" : "desactivado"}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar proveedor");
    }
  };

  const handleCreatePaymentProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await fetchAPI<PaymentProvider>("/v1/payment-providers", { method: "POST", data: editPaymentProvider });
      setPaymentProviders([...paymentProviders, data!]);
      setEditPaymentProvider(null);
      setSuccess("Proveedor creado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear proveedor");
    }
  };

  const handleUpdatePaymentProvider = async (e: React.FormEvent) => {
    if (!editPaymentProvider?.id) return;
    try {
      const { data } = await fetchAPI<PaymentProvider>(`/v1/payment-providers/${editPaymentProvider.id}`, {
        method: "PUT",
        data: editPaymentProvider,
      });
      setPaymentProviders(paymentProviders.map((p) => (p.id === data!.id ? data! : p)));
      setEditPaymentProvider(null);
      setSuccess("Proveedor actualizado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar proveedor");
    }
  };

  const handleDeletePaymentProvider = async (id: number) => {
    try {
      await fetchAPI(`/v1/payment-providers/${id}`, { method: "DELETE" });
      setPaymentProviders(paymentProviders.filter((p) => p.id !== id));
      setSuccess("Proveedor eliminado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar proveedor");
    }
  };

  if (loading) return <div className="text-center p-4 text-xl">Cargando Dashboard...</div>;

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-bold text-center mb-8">
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
        <Tab label="Gamificación" />
        <Tab label="Medios de Pago" />
      </Tabs>

      <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-6">
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
          <Typography variant="h6" className="mb-4">
            Control de Funcionalidades
          </Typography>
          <div className="space-y-4">
            <FormControlLabel
              control={
                <Switch
                  checked={features.enable_registration}
                  onChange={(e) => handleToggleFeature("enable_registration", e.target.checked)}
                  color="primary"
                />
              }
              label="Habilitar Registro"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={features.enable_social_login}
                  onChange={(e) => handleToggleFeature("enable_social_login", e.target.checked)}
                  color="primary"
                />
              }
              label="Habilitar Login Social"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={features.disable_anonymous_users}
                  onChange={(e) => handleToggleFeature("disable_anonymous_users", e.target.checked)}
                  color="primary"
                />
              }
              label="Deshabilitar Usuarios Anónimos"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={features.disable_credits}
                  onChange={(e) => handleToggleFeature("disable_credits", e.target.checked)}
                  color="primary"
                />
              }
              label="Desactivar Créditos"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={features.enable_payment_methods}
                  onChange={(e) => handleToggleFeature("enable_payment_methods", e.target.checked)}
                  color="primary"
                />
              }
              label="Habilitar Medios de Pago"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={features.enable_points}
                  onChange={(e) => handleToggleFeature("enable_points", e.target.checked)}
                  color="primary"
                />
              }
              label="Habilitar Puntos"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={features.enable_badges}
                  onChange={(e) => handleToggleFeature("enable_badges", e.target.checked)}
                  color="primary"
                />
              }
              label="Habilitar Insignias"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )}

{activeTab === 4 && (
    <div className="space-y-4">
      <Card>
        <CardContent>
          <Typography variant="h6">Tipos de Evento</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Puntos</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eventTypes.map((et) => (
                <TableRow key={et.id}>
                  <TableCell>{et.id}</TableCell>
                  <TableCell>{et.name}</TableCell>
                  <TableCell>{et.description}</TableCell>
                  <TableCell>{et.points_per_event}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => setEditEventType(et)}>
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteEventType(et.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            variant="contained"
            startIcon={<AddCircle />}
            onClick={() => setEditEventType({ id: 0, name: "", description: "", points_per_event: 0 })}
            className="mt-4"
          >
            Crear Tipo de Evento
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6">Badges</Typography>
          {eventTypes.map((eventType) => (
            <Accordion key={eventType.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>{eventType.name} (ID: {eventType.id})</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Descripción</TableCell>
                      <TableCell>Puntos Requeridos</TableCell>
                      <TableCell>Tipo Usuario</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(groupedBadges[eventType.id] || []).map((badge) => (
                      <TableRow key={badge.id}>
                        <TableCell>{badge.name}</TableCell>
                        <TableCell>{badge.description}</TableCell>
                        <TableCell>{badge.required_points}</TableCell>
                        <TableCell>{badge.user_type}</TableCell>
                        <TableCell>
                          <IconButton onClick={() => setEditBadge(badge)}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteBadge(badge.id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionDetails>
            </Accordion>
          ))}
          <Button
            variant="contained"
            startIcon={<AddCircle />}
            onClick={() =>
              setEditBadge({ id: 0, name: "", description: "", event_type_id: eventTypes[0]?.id || 0, required_points: 0, user_type: "both" })
            }
            className="mt-4"
            disabled={eventTypes.length === 0}
          >
            Crear Badge
          </Button>
        </CardContent>
      </Card>

            <Dialog open={!!editBadge} onClose={() => setEditBadge(null)}>
              <DialogTitle>{editBadge?.id ? "Editar Badge" : "Crear Badge"}</DialogTitle>
              <DialogContent>
                <Box
                  component="form"
                  onSubmit={editBadge?.id ? handleUpdateBadge : handleCreateBadge}
                  sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
                >
                  <TextField
                    label="Nombre"
                    value={editBadge?.name || ""}
                    onChange={(e) => setEditBadge({ ...editBadge!, name: e.target.value })}
                    required
                  />
                  <TextField
                    label="Descripción"
                    value={editBadge?.description || ""}
                    onChange={(e) => setEditBadge({ ...editBadge!, description: e.target.value })}
                  />
                  <TextField
                    label="Tipo Evento ID"
                    type="number"
                    value={editBadge?.event_type_id || 0}
                    onChange={(e) => setEditBadge({ ...editBadge!, event_type_id: parseInt(e.target.value) || 0 })}
                    required
                  />
                  <TextField
                    label="Puntos Requeridos"
                    type="number"
                    value={editBadge?.required_points || 0}
                    onChange={(e) => setEditBadge({ ...editBadge!, required_points: parseInt(e.target.value) || 0 })}
                    required
                  />
                  <TextField
                    label="Tipo Usuario"
                    select
                    value={editBadge?.user_type || "both"}
                    onChange={(e) => setEditBadge({ ...editBadge!, user_type: e.target.value as "anonymous" | "registered" | "both" })}
                    SelectProps={{ native: true }}
                  >
                    <option value="anonymous">Anonymous</option>
                    <option value="registered">Registered</option>
                    <option value="both">Both</option>
                  </TextField>
                  <Button type="submit" variant="contained">
                    {editBadge?.id ? "Actualizar" : "Crear"}
                  </Button>
                </Box>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === 5 && (
          <div className="space-y-4">
            <Card>
              <CardContent>
                <Typography variant="h6">Proveedores de Pago</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Activo</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentProviders.map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell>{provider.name}</TableCell>
                        <TableCell>
                          <Switch
                            checked={provider.active}
                            onChange={(e) => handleTogglePaymentProvider(provider.id, e.target.checked)}
                            color="primary"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => setEditPaymentProvider(provider)}>
                            <Edit />
                          </IconButton>
                          <IconButton onClick={() => handleDeletePaymentProvider(provider.id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Button
                  variant="contained"
                  startIcon={<AddCircle />}
                  onClick={() => setEditPaymentProvider({ id: 0, name: "", active: true })}
                  className="mt-4"
                >
                  Añadir Proveedor
                </Button>
              </CardContent>
            </Card>

            <Dialog open={!!editPaymentProvider} onClose={() => setEditPaymentProvider(null)}>
              <DialogTitle>{editPaymentProvider?.id ? "Editar Proveedor" : "Crear Proveedor"}</DialogTitle>
              <DialogContent>
                <Box
                  component="form"
                  onSubmit={editPaymentProvider?.id ? handleUpdatePaymentProvider : handleCreatePaymentProvider}
                  sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
                >
                  <TextField
                    label="Nombre"
                    value={editPaymentProvider?.name || ""}
                    onChange={(e) => setEditPaymentProvider({ ...editPaymentProvider!, name: e.target.value })}
                    required
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editPaymentProvider?.active || false}
                        onChange={(e) => setEditPaymentProvider({ ...editPaymentProvider!, active: e.target.checked })}
                      />
                    }
                    label="Activo"
                  />
                  <Button type="submit" variant="contained">
                    {editPaymentProvider?.id ? "Actualizar" : "Crear"}
                  </Button>
                </Box>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </motion.div>
    </div>
  );
}