// frontend/src/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import {
  Box, Typography, TextField, Button, IconButton, Switch, FormControlLabel,
  Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, Select, MenuItem, Grid, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Divider, useTheme,
  Tabs,
  Tab
} from "@mui/material";
import {
  AddCircle, Delete, Edit, Settings, Public, Link, Webhook, EmojiEvents,
  MonetizationOn, LocalActivity, LockPerson, Security, PersonAdd, PeopleOutline,
  AttachMoney
} from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import MinimalCard from "@/components/ui/MinimalCard";
import MinimalForm from "@/components/ui/MinimalForm";
import Notification from "@/components/ui/Notification";
import { SiteSetting, Integration, EventType, Badge, PaymentProvider, Coupon, CouponType } from "@/lib/types";

// Estilos personalizados
const Sidebar = styled('div')(({ theme }) => ({
  width: 280,
  flexShrink: 0,
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  height: '100vh',
  overflow: 'auto',
}));

const MainContent = styled('div')({
  flexGrow: 1,
  overflow: 'auto',
  padding: '24px',
  backgroundColor: '#f9fafb',
});

const SectionCard = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[1],
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const tabs = [
  { label: 'Funcionalidades', icon: <LockPerson /> },
  { label: 'Orígenes', icon: <Security /> },
  { label: 'Integraciones', icon: <Link /> },
  { label: 'Gamificación', icon: <EmojiEvents /> },
  { label: 'Cupones', icon: <LocalActivity /> },
  { label: 'Pagos', icon: <MonetizationOn /> },
  { label: 'Configuraciones', icon: <Settings /> },
];

interface AllowedOrigin {
  id: number;
  origin: string;
}

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
    enable_points: true,
    enable_badges: true,
    enable_coupons: true,
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
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [couponTypes, setCouponTypes] = useState<CouponType[]>([]);
  const [editCouponType, setEditCouponType] = useState<CouponType | null>(null);
  const [corsEnabled, setCorsEnabled] = useState<boolean | null>(null);

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

        const originsRes = await fetchAPI<string[]>("/v1/settings/allowed_origins");
        setOrigins(originsRes.data || []);

        const integrationsRes = await fetchAPI<Integration[]>("/v1/integrations/");
        setIntegrations(integrationsRes.data || []);

        const eventTypesRes = await fetchAPI<EventType[]>("/v1/gamification/event-types");
        setEventTypes(eventTypesRes.data || []);

        const badgesRes = await fetchAPI<Badge[]>("/v1/gamification/badges");
        setBadges(badgesRes.data || []);

        const paymentProvidersRes = await fetchAPI<PaymentProvider[]>("/v1/payment-providers");
        setPaymentProviders(paymentProvidersRes.data || []);

        const couponTypesRes = await fetchAPI<CouponType[]>("/v1/coupons/types");
        setCouponTypes(couponTypesRes.data || []);

        const couponsRes = await fetchAPI<Coupon[]>("/v1/coupons/");
        setCoupons(couponsRes.data || []);

        const featuresRes = await Promise.all([
          fetchAPI("/v1/settings/enable_registration"),
          fetchAPI("/v1/settings/enable_social_login"),
          fetchAPI("/v1/settings/disable_anonymous_users"),
          fetchAPI("/v1/settings/disable_credits"),
          fetchAPI("/v1/settings/enable_payment_methods"),
          fetchAPI("/v1/settings/enable_points"),
          fetchAPI("/v1/settings/enable_badges"),
          fetchAPI("/v1/settings/enable_coupons"),
        ]);
        setFeatures({
          enable_registration: featuresRes[0].data === "true",
          enable_social_login: featuresRes[1].data === "true",
          disable_anonymous_users: featuresRes[2].data === "true",
          disable_credits: featuresRes[3].data === "true",
          enable_payment_methods: featuresRes[4].data === "true",
          enable_points: featuresRes[5].data === "true",
          enable_badges: featuresRes[6].data === "true",
          enable_coupons: featuresRes[7].data === "true",
        });

        const corsRes = await fetchAPI("/v1/settings/cors_enabled");
        setCorsEnabled(corsRes.data === "true");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, router]);

  const handleToggleCors = async () => {
    try {
      const { data } = await fetchAPI<{ key: string; value: boolean }>("/v1/settings/admin/config", {
        method: "POST",
        data: { key: "allowed_origins", value: !corsEnabled },
      });
      setCorsEnabled(data!.value);
      setSuccess(`CORS ${data!.value ? "activado" : "desactivado"}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar CORS");
    }
  };

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al añadir origen");
    }
  };

  const handleDeleteOrigin = async (origin: string) => {
    try {
      await fetchAPI(`/v1/settings/allowed-origins/${encodeURIComponent(origin)}`, { method: "DELETE" });
      setOrigins(origins.filter(o => o !== origin));
      setSuccess("Origen eliminado con éxito");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar origen");
    }
  };

  const handleAddIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await fetchAPI<Integration>("/v1/integrations/", {
        method: "POST",
        data: { name: newIntegration.name, webhook_url: newIntegration.webhook_url, event_type: newIntegration.event_type },
      });
      setIntegrations([...integrations, data]);
      setNewIntegration({ name: "", webhook_url: "", event_type: "" });
      setSuccess("Integración creada con éxito");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear integración");
    }
  };

  const handleToggleIntegration = async (id: number, active: boolean) => {
    try {
      const { data } = await fetchAPI<{ id: number; active: boolean }>(`/v1/integrations/${id}/toggle`, { method: "PUT" });
      setIntegrations(integrations.map(i => i.id === id ? { ...i, active: data!.active } : i));
      setSuccess(`Integración ${data!.active ? "activada" : "desactivada"}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar integración");
    }
  };

  const handleDeleteIntegration = async (id: number) => {
    try {
      await fetchAPI(`/v1/integrations/${id}`, { method: "DELETE" });
      setIntegrations(integrations.filter(i => i.id !== id));
      setSuccess("Integración eliminada con éxito");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar integración");
    }
  };

  const handleToggleFeature = async (feature: string, enabled: boolean) => {
    try {
      await fetchAPI("/v1/settings/admin/config", { method: "POST", data: { key: feature, value: enabled.toString() } });
      setFeatures((prev) => ({ ...prev, [feature]: enabled }));
      setSuccess(`Funcionalidad ${enabled ? "activada" : "desactivada"} con éxito`);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear tipo de evento");
    }
  };

  const handleUpdateEventType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEventType?.id) return;
    try {
      const { data } = await fetchAPI<EventType>(`/v1/gamification/event-types/${editEventType.id}`, { method: "PUT", data: editEventType });
      setEventTypes(eventTypes.map((et) => (et.id === data!.id ? data! : et)));
      setEditEventType(null);
      setSuccess("Tipo de evento actualizado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar tipo de evento");
    }
  };

  const handleDeleteEventType = async (id: number) => {
    try {
      await fetchAPI(`/v1/gamification/event-types/${id}`, { method: "DELETE" });
      setEventTypes(eventTypes.filter((et) => (et.id !== id)));
      setSuccess("Tipo de evento eliminado");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear badge");
    }
  };

  const handleUpdateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBadge?.id) return;
    try {
      const { data } = await fetchAPI<Badge>(`/v1/gamification/badges/${editBadge.id}`, { method: "PUT", data: editBadge });
      setBadges(badges.map((b) => (b.id === data!.id ? data! : b)));
      setEditBadge(null);
      setSuccess("Badge actualizado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar badge");
    }
  };

  const handleDeleteBadge = async (id: number) => {
    try {
      await fetchAPI(`/v1/gamification/badges/${id}`, { method: "DELETE" });
      setBadges(badges.filter((b) => b.id !== id));
      setSuccess("Badge eliminado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar badge");
    }
  };

  const handleTogglePaymentProvider = async (id: number, active: boolean) => {
    try {
      const provider = paymentProviders.find(p => p.id === id);
      if (!provider) throw new Error("Proveedor no encontrado");
      const updatedProvider = { ...provider, active: !active };
      const { data } = await fetchAPI<PaymentProvider>(`/v1/payment-providers/${id}`, { method: "PUT", data: updatedProvider });
      setPaymentProviders(paymentProviders.map((p) => (p.id === data!.id ? data! : p)));
      setSuccess(`Proveedor ${!active ? "activado" : "desactivado"}`);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear proveedor");
    }
  };

  const handleUpdatePaymentProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPaymentProvider?.id) return;
    try {
      const { data } = await fetchAPI<PaymentProvider>(`/v1/payment-providers/${editPaymentProvider.id}`, { method: "PUT", data: editPaymentProvider });
      setPaymentProviders(paymentProviders.map((p) => (p.id === data!.id ? data! : p)));
      setEditPaymentProvider(null);
      setSuccess("Proveedor actualizado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar proveedor");
    }
  };

  const handleDeletePaymentProvider = async (id: number) => {
    try {
      await fetchAPI(`/v1/payment-providers/${id}`, { method: "DELETE" });
      setPaymentProviders(paymentProviders.filter((p) => p.id !== id));
      setSuccess("Proveedor eliminado");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar proveedor");
    }
  };

  const handleSubmitCouponType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCouponType) return;
    try {
      if (editCouponType.id) {
        const { data } = await fetchAPI<CouponType>(`/v1/coupons/types/${editCouponType.id}`, { method: "PUT", data: editCouponType });
        setCouponTypes(couponTypes.map(ct => ct.id === data!.id ? data! : ct));
      } else {
        const { data } = await fetchAPI<CouponType>("/v1/coupons/types", { method: "POST", data: editCouponType });
        setCouponTypes([...couponTypes, data!]);
      }
      setEditCouponType(null);
      setSuccess("Tipo de cupón guardado con éxito");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar tipo de cupón");
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    try {
      await fetchAPI(`/v1/coupons/${id}`, { method: "DELETE" });
      setCoupons(coupons.filter((c) => c.id !== id));
      setSuccess("Cupón eliminado con éxito");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar cupón");
    }
  };
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Panel de Administración
          </Typography>
          <List>
            {tabs.map((tab, index) => (
              <ListItem key={tab.label} disablePadding>
                <ListItemButton
                  selected={activeTab === index}
                  onClick={() => setActiveTab(index)}
                  sx={{
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: useTheme().palette.action.selected,
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {tab.icon}
                  </ListItemIcon>
                  <ListItemText primary={tab.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Sidebar>

      <MainContent>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <MinimalCard
              title="Configuraciones"
              value={Object.values(settingsByTag).flat().length}
              icon={<Settings />}
              gradient
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MinimalCard
              title="Orígenes"
              value={origins.length}
              icon={<Public />}
              gradient
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MinimalCard
              title="Integraciones"
              value={integrations.length}
              icon={<Webhook />}
              gradient
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <MinimalCard
              title="Pagos"
              value={paymentProviders.length}
              icon={<MonetizationOn />}
              gradient
            />
          </Grid>
        </Grid>

        {/* Tab Content */}
        <SectionCard>
          {activeTab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>Autenticación</Typography>
                <FormControlLabel
                  control={<Switch checked={features.enable_registration} onChange={(e) => handleToggleFeature('enable_registration', e.target.checked)} />}
                  label="Registro de Usuarios"
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch checked={features.enable_social_login} onChange={(e) => handleToggleFeature('enable_social_login', e.target.checked)} />}
                  label="Login Social"
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch checked={features.disable_anonymous_users} onChange={(e) => handleToggleFeature('disable_anonymous_users', e.target.checked)} />}
                  label="Bloquear Usuarios Anónimos"
                  sx={{ mb: 1 }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ mb: 2 }}>Funcionalidades</Typography>
                <FormControlLabel
                  control={<Switch checked={!features.disable_credits} onChange={(e) => handleToggleFeature('disable_credits', !e.target.checked)} />}
                  label="Sistema de Créditos"
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch checked={features.enable_payment_methods} onChange={(e) => handleToggleFeature('enable_payment_methods', e.target.checked)} />}
                  label="Métodos de Pago"
                  sx={{ mb: 1 }}
                />
                <FormControlLabel
                  control={<Switch checked={features.enable_points} onChange={(e) => handleToggleFeature('enable_points', e.target.checked)} />}
                  label="Sistema de Puntos"
                  sx={{ mb: 1 }}
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6">Orígenes Permitidos</Typography>
                <Switch checked={corsEnabled ?? false} onChange={handleToggleCors} />
              </Box>
              {corsEnabled && (
                <MinimalForm onSubmit={handleAddOrigin}>
                  <TextField label="Nuevo Origen" value={newOrigin} onChange={(e) => setNewOrigin(e.target.value)} />
                </MinimalForm>
              )}
              <Table sx={{ bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
                <TableHead><TableRow><TableCell>Origen</TableCell><TableCell>Acciones</TableCell></TableRow></TableHead>
                <TableBody>
                  {origins.map(o => (
                    <TableRow key={o}><TableCell>{o}</TableCell><TableCell><IconButton onClick={() => handleDeleteOrigin(o)}><Delete /></IconButton></TableCell></TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <MinimalForm onSubmit={handleAddIntegration}>
                <TextField label="Nombre" value={newIntegration.name} onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })} />
                <TextField label="Webhook URL" value={newIntegration.webhook_url} onChange={(e) => setNewIntegration({ ...newIntegration, webhook_url: e.target.value })} />
                <TextField label="Tipo de Evento" value={newIntegration.event_type} onChange={(e) => setNewIntegration({ ...newIntegration, event_type: e.target.value })} />
              </MinimalForm>
              <Table sx={{ bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
                <TableHead><TableRow><TableCell>Nombre</TableCell><TableCell>Estado</TableCell><TableCell>Acciones</TableCell></TableRow></TableHead>
                <TableBody>
                  {integrations.map(i => (
                    <TableRow key={i.id}>
                      <TableCell>{i.name}</TableCell>
                      <TableCell><Switch checked={i.active} onChange={() => handleToggleIntegration(i.id, i.active)} /></TableCell>
                      <TableCell><IconButton onClick={() => handleDeleteIntegration(i.id)}><Delete /></IconButton></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {activeTab === 3 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Tipos de Evento</Typography>
              <Button onClick={() => setEditEventType({ id: 0, name: '', description: '', points_per_event: 0 })} startIcon={<AddCircle />}>Nuevo Tipo</Button>
              <Table sx={{ bgcolor: "white", borderRadius: 2, boxShadow: 1, mb: 3 }}>
                <TableHead><TableRow><TableCell>Nombre</TableCell><TableCell>Descripción</TableCell><TableCell>Puntos</TableCell><TableCell>Acciones</TableCell></TableRow></TableHead>
                <TableBody>
                  {eventTypes.map(et => (
                    <TableRow key={et.id}>
                      <TableCell>{et.name}</TableCell>
                      <TableCell>{et.description}</TableCell>
                      <TableCell>{et.points_per_event}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => setEditEventType(et)}><Edit /></IconButton>
                        <IconButton onClick={() => handleDeleteEventType(et.id)}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Typography variant="h6" sx={{ mb: 2 }}>Insignias</Typography>
              <Button onClick={() => setEditBadge({ id: 0, name: '', description: '', event_type_id: eventTypes[0]?.id || 0, required_points: 0, user_type: 'both' })} startIcon={<AddCircle />}>Nueva Insignia</Button>
              <Table sx={{ bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
                <TableHead><TableRow><TableCell>Nombre</TableCell><TableCell>Puntos</TableCell><TableCell>Tipo</TableCell><TableCell>Acciones</TableCell></TableRow></TableHead>
                <TableBody>
                  {badges.map(b => (
                    <TableRow key={b.id}>
                      <TableCell>{b.name}</TableCell>
                      <TableCell>{b.required_points}</TableCell>
                      <TableCell>{b.user_type}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => setEditBadge(b)}><Edit /></IconButton>
                        <IconButton onClick={() => handleDeleteBadge(b.id)}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Dialog open={!!editEventType} onClose={() => setEditEventType(null)}>
                <DialogTitle>{editEventType?.id ? "Editar" : "Nuevo"} Tipo de Evento</DialogTitle>
                <DialogContent>
                  <MinimalForm onSubmit={editEventType?.id ? handleUpdateEventType : handleCreateEventType}>
                    <TextField label="Nombre" value={editEventType?.name || ''} onChange={(e) => setEditEventType({ ...editEventType!, name: e.target.value })} />
                    <TextField label="Descripción" value={editEventType?.description || ''} onChange={(e) => setEditEventType({ ...editEventType!, description: e.target.value })} />
                    <TextField label="Puntos" type="number" value={editEventType?.points_per_event || 0} onChange={(e) => setEditEventType({ ...editEventType!, points_per_event: parseInt(e.target.value) || 0 })} />
                  </MinimalForm>
                </DialogContent>
              </Dialog>
              <Dialog open={!!editBadge} onClose={() => setEditBadge(null)}>
                <DialogTitle>{editBadge?.id ? "Editar" : "Nueva"} Insignia</DialogTitle>
                <DialogContent>
                  <MinimalForm onSubmit={editBadge?.id ? handleUpdateBadge : handleCreateBadge}>
                    <TextField label="Nombre" value={editBadge?.name || ''} onChange={(e) => setEditBadge({ ...editBadge!, name: e.target.value })} />
                    <TextField label="Descripción" value={editBadge?.description || ''} onChange={(e) => setEditBadge({ ...editBadge!, description: e.target.value })} />
                    <TextField label="Puntos" type="number" value={editBadge?.required_points || 0} onChange={(e) => setEditBadge({ ...editBadge!, required_points: parseInt(e.target.value) || 0 })} />
                    <TextField select label="Tipo de Evento" value={editBadge?.event_type_id || 0} onChange={(e) => setEditBadge({ ...editBadge!, event_type_id: parseInt(e.target.value) })}>
                      {eventTypes.map(et => <MenuItem key={et.id} value={et.id}>{et.name}</MenuItem>)}
                    </TextField>
                    <TextField select label="Tipo de Usuario" value={editBadge?.user_type || 'both'} onChange={(e) => setEditBadge({ ...editBadge!, user_type: e.target.value as any })}>
                      <MenuItem value="anonymous">Anónimo</MenuItem>
                      <MenuItem value="registered">Registrado</MenuItem>
                      <MenuItem value="both">Ambos</MenuItem>
                    </TextField>
                  </MinimalForm>
                </DialogContent>
              </Dialog>
            </Box>
          )}

          {activeTab === 4 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Tipos de Cupones</Typography>
              <Button onClick={() => setEditCouponType({ id: 0, name: '', description: '', credits: 0, active: true })} startIcon={<AddCircle />}>Nuevo Tipo</Button>
              <Table sx={{ bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
                <TableHead><TableRow><TableCell>Nombre</TableCell><TableCell>Créditos</TableCell><TableCell>Activo</TableCell><TableCell>Acciones</TableCell></TableRow></TableHead>
                <TableBody>
                  {couponTypes.map(ct => (
                    <TableRow key={ct.id}>
                      <TableCell>{ct.name}</TableCell>
                      <TableCell>{ct.credits}</TableCell>
                      <TableCell>{ct.active ? "Sí" : "No"}</TableCell>
                      <TableCell>
                        <IconButton onClick={() => setEditCouponType(ct)}><Edit /></IconButton>
                        <Button onClick={async () => {
                          const { data } = await fetchAPI<Coupon>("/v1/coupons/test", { method: "POST", data: { coupon_type_id: ct.id } });
                          setCoupons([...coupons, data!]);
                          setSuccess("Cupón de prueba generado");
                        }}>Generar Prueba</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Dialog open={!!editCouponType} onClose={() => setEditCouponType(null)}>
                <DialogTitle>{editCouponType?.id ? "Editar" : "Nuevo"} Tipo de Cupón</DialogTitle>
                <DialogContent>
                  <MinimalForm onSubmit={handleSubmitCouponType}>
                    <TextField label="Nombre" value={editCouponType?.name || ''} onChange={(e) => setEditCouponType({ ...editCouponType!, name: e.target.value })} />
                    <TextField label="Descripción" value={editCouponType?.description || ''} onChange={(e) => setEditCouponType({ ...editCouponType!, description: e.target.value })} />
                    <TextField label="Créditos" type="number" value={editCouponType?.credits || 0} onChange={(e) => setEditCouponType({ ...editCouponType!, credits: parseInt(e.target.value) || 0 })} />
                    <FormControlLabel control={<Switch checked={editCouponType?.active || false} onChange={(e) => setEditCouponType({ ...editCouponType!, active: e.target.checked })} />} label="Activo" />
                  </MinimalForm>
                </DialogContent>
              </Dialog>
            </Box>
          )}

          {activeTab === 5 && (
            <Box>
              <Button onClick={() => setEditPaymentProvider({ id: 0, name: '', active: true })} startIcon={<AddCircle />}>Nuevo Proveedor</Button>
              <Table sx={{ bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
                <TableHead><TableRow><TableCell>Nombre</TableCell><TableCell>Estado</TableCell><TableCell>Acciones</TableCell></TableRow></TableHead>
                <TableBody>
                  {paymentProviders.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>{p.name}</TableCell>
                      <TableCell><Switch checked={p.active} onChange={() => handleTogglePaymentProvider(p.id, p.active)} /></TableCell>
                      <TableCell>
                        <IconButton onClick={() => setEditPaymentProvider(p)}><Edit /></IconButton>
                        <IconButton onClick={() => handleDeletePaymentProvider(p.id)}><Delete /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Dialog open={!!editPaymentProvider} onClose={() => setEditPaymentProvider(null)}>
                <DialogTitle>{editPaymentProvider?.id ? "Editar" : "Nuevo"} Proveedor</DialogTitle>
                <DialogContent>
                  <MinimalForm onSubmit={editPaymentProvider?.id ? handleUpdatePaymentProvider : handleCreatePaymentProvider}>
                    <TextField label="Nombre" value={editPaymentProvider?.name || ''} onChange={(e) => setEditPaymentProvider({ ...editPaymentProvider!, name: e.target.value })} />
                    <FormControlLabel control={<Switch checked={editPaymentProvider?.active || false} onChange={(e) => setEditPaymentProvider({ ...editPaymentProvider!, active: e.target.checked })} />} label="Activo" />
                  </MinimalForm>
                </DialogContent>
              </Dialog>
            </Box>
          )}

          {activeTab === 6 && (
            <Box>
              {Object.entries(settingsByTag).map(([tag, settings]) => (
                <Box key={tag} sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>{tag}</Typography>
                  <Grid container spacing={2}>
                    {settings.map(s => (
                      <Grid item xs={12} sm={6} key={s.key}>
                        <TextField label={s.key} defaultValue={s.value} onBlur={(e) => handleSaveSetting(s.key, e.target.value)} fullWidth helperText={s.description} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          )}

        </SectionCard>

        {/* Notifications */}
        {error && <Notification message={error} severity="error" onClose={() => setError(null)} />}
        {success && <Notification message={success} severity="success" onClose={() => setSuccess(null)} />}
      </MainContent>
    </Box>
  );
}