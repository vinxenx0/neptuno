// src/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import {
  Tabs, Tab, Card, CardContent, TextField, Button, Accordion, AccordionSummary, AccordionDetails, Typography, IconButton,
  Snackbar, Alert, Avatar, Chip, Divider, List, ListItem, ListItemText, Paper, useTheme, styled, Box,
  Switch, FormControlLabel, Table, TableBody, TableCell, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  AddCircle, Delete, ExpandMore, Settings, Public, Link, Webhook, CheckCircle, Cancel, Security, PersonAdd, LockPerson,
  PeopleOutline, AttachMoney, Edit, EmojiEvents, MonetizationOn, LocalActivity, Send
} from "@mui/icons-material";
import { SiteSetting, Integration, EventType, Badge, PaymentProvider, Coupon, CouponType } from "@/lib/types";
import { useSocketNotifications } from "@/lib/useSocketNotifications";

interface AllowedOrigin {
  id: number;
  origin: string;
}

const AdminGradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: '16px',
  boxShadow: theme.shadows[10],
  transition: 'transform 0.3s ease',
  '&:hover': { transform: 'translateY(-5px)' }
}));

const ConfigGlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  boxShadow: theme.shadows[5]
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
  '&:hover': { transform: 'translateY(-5px)', boxShadow: theme.shadows[8] }
}));

export default function ConfigurePage() {
  const { user } = useAuth();
  const { socket } = useSocketNotifications();
  const router = useRouter();
  const theme = useTheme();
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
  const [expandedSettings, setExpandedSettings] = useState<Record<string, boolean>>({});
  const [allSettingsExpanded, setAllSettingsExpanded] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [couponTypes, setCouponTypes] = useState<CouponType[]>([]);
  const [editCouponType, setEditCouponType] = useState<CouponType | null>(null);
  const [corsEnabled, setCorsEnabled] = useState<boolean | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [loadingPanel, setLoadingPanel] = useState(true);

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

        if (grouped) {
          const initialExpandedState = Object.keys(grouped).reduce((acc, tag) => {
            acc[tag] = false;
            return acc;
          }, {} as Record<string, boolean>);
          setExpandedSettings(initialExpandedState);
        }

        const originsRes = await fetchAPI<AllowedOrigin[]>("/v1/origins");
        setOrigins(originsRes.data?.map(o => o.origin) || []);

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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setLoading(false);
        setLoadingPanel(false);
      }
    };
    fetchData();
  }, [user, router]);

  useEffect(() => {
    const fetchCorsSettings = async () => {
      try {
        const { data: corsEnabledData } = await fetchAPI("/v1/settings/cors_enabled");
        setCorsEnabled(corsEnabledData === "true");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar configuración de CORS");
      }
    };
    fetchCorsSettings();
  }, []);

  const handleToggleCors = async () => {
    try {
      const newValue = !corsEnabled;
      await fetchAPI("/v1/settings/admin/config", {
        method: "POST",
        data: { key: "cors_enabled", value: newValue.toString() },
      });
      setCorsEnabled(newValue);
      setSuccess(`CORS ${newValue ? "activado" : "desactivado"}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar CORS");
    }
  };

  const handleSaveSetting = async (key: string, newValue: string) => {
    try {
      await fetchAPI("/v1/settings/admin/config", {
        method: "POST",
        data: { key, value: newValue },
      });
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

  const refreshOrigins = async () => {
    try {
      const { data } = await fetchAPI<AllowedOrigin[]>("/v1/origins");
      setOrigins(data?.map(o => o.origin) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al refrescar orígenes");
    }
  };

  const handleAddOrigin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI("/v1/origins", {
        method: "POST",
        data: { origin: newOrigin },
      });
      setNewOrigin("");
      setSuccess("Origen añadido");
      await refreshOrigins();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al añadir origen");
    }
  };

  const handleDeleteOrigin = async (origin: string) => {
    try {
      await fetchAPI(`/v1/origins/${encodeURIComponent(origin)}`, {
        method: "DELETE",
      });
      setSuccess("Origen eliminado");
      await refreshOrigins();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar origen");
    }
  };

  const handleAddIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      
      const { data } = await fetchAPI<Integration>("/v1/integrations/", {
        method: "POST",
        data: newIntegration,
      });
      setIntegrations([...integrations, data]);
      setNewIntegration({ name: "", webhook_url: "", event_type: "" });
      setSuccess("Integración añadida");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al añadir integración");
    }
  };

  const handleToggleIntegration = async (id: number) => {
    try {
      const integration = integrations.find((i) => i.id === id);
      if (!integration) return;
      const { data } = await fetchAPI<Integration>(`/v1/integrations/${id}/toggle`, {
        method: "PUT",
      });
      setIntegrations(
        integrations.map((i) =>
          i.id === id ? { ...i, active: data.active } : i
        )
      );
      setSuccess(`Integración ${data.active ? "activada" : "desactivada"}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar integración");
    }
  };

  const handleDeleteIntegration = async (id: number) => {
    try {
      await fetchAPI(`/v1/integrations/${id}`, { method: "DELETE" });
      setIntegrations(integrations.filter((i) => i.id !== id));
      setSuccess("Integración eliminada");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar integración");
    }
  };

  const handleToggleFeature = async (feature: keyof typeof features, value: boolean) => {
    try {
      await fetchAPI("/v1/settings/admin/config", {
        method: "POST",
        data: { key: feature, value: value.toString() },
      });
      setFeatures((prev) => ({ ...prev, [feature]: value }));
      setSuccess(`Funcionalidad ${value ? "activada" : "desactivada"}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar funcionalidad");
    }
  };

  const handleCreateEventType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEventType) return;
    try {
      const { data } = await fetchAPI<EventType>("/v1/gamification/event-types", {
        method: "POST",
        data: editEventType,
      });
      setEventTypes([...eventTypes, data]);
      setEditEventType(null);
      setSuccess("Tipo de evento creado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear tipo de evento");
    }
  };

  const handleUpdateEventType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEventType?.id) return;
    try {
      const { data } = await fetchAPI<EventType>(`/v1/gamification/event-types/${editEventType.id}`, {
        method: "PUT",
        data: editEventType,
      });
      setEventTypes(eventTypes.map((et) => (et.id === data.id ? data : et)));
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
    if (!editBadge) return;
    try {
      const { data } = await fetchAPI<Badge>("/v1/gamification/badges", {
        method: "POST",
        data: editBadge,
      });
      setBadges([...badges, data]);
      setEditBadge(null);
      setSuccess("Insignia creada");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear insignia");
    }
  };

  const handleUpdateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBadge?.id) return;
    try {
      const { data } = await fetchAPI<Badge>(`/v1/gamification/badges/${editBadge.id}`, {
        method: "PUT",
        data: editBadge,
      });
      setBadges(badges.map((b) => (b.id === data.id ? data : b)));
      setEditBadge(null);
      setSuccess("Insignia actualizada");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar insignia");
    }
  };

  const handleDeleteBadge = async (id: number) => {
    try {
      await fetchAPI(`/v1/gamification/badges/${id}`, { method: "DELETE" });
      setBadges(badges.filter((b) => b.id !== id));
      setSuccess("Insignia eliminada");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar insignia");
    }
  };

  const handleCreatePaymentProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPaymentProvider) return;
    try {
      const { data } = await fetchAPI<PaymentProvider>("/v1/payment-providers", {
        method: "POST",
        data: editPaymentProvider,
      });
      setPaymentProviders([...paymentProviders, data]);
      setEditPaymentProvider(null);
      setSuccess("Proveedor de pago creado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear proveedor");
    }
  };

  const handleUpdatePaymentProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPaymentProvider?.id) return;
    try {
      const { data } = await fetchAPI<PaymentProvider>(`/v1/payment-providers/${editPaymentProvider.id}`, {
        method: "PUT",
        data: editPaymentProvider,
      });
      setPaymentProviders(paymentProviders.map((p) => (p.id === data.id ? data : p)));
      setEditPaymentProvider(null);
      setSuccess("Proveedor de pago actualizado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar proveedor");
    }
  };

  const handleTogglePaymentProvider = async (id: number) => {
    try {
      const provider = paymentProviders.find((p) => p.id === id);
      if (!provider) return;
      const { data } = await fetchAPI<PaymentProvider>(`/v1/payment-providers/${id}`, {
        method: "PUT",
        data: { ...provider, active: !provider.active },
      });
      setPaymentProviders(paymentProviders.map((p) => (p.id === data.id ? data : p)));
      setSuccess(`Proveedor ${data.active ? "activado" : "desactivado"}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar proveedor");
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCoupon) return;
    try {
      const { data } = await fetchAPI<Coupon>("/v1/coupons/", {
        method: "POST",
        data: editCoupon,
      });
      setCoupons([...coupons, data]);
      setEditCoupon(null);
      setSuccess("Cupón creado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear cupón");
    }
  };

  const handleUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCoupon?.id) return;
    try {
      const { data } = await fetchAPI<Coupon>(`/v1/coupons/${editCoupon.id}`, {
        method: "PUT",
        data: editCoupon,
      });
      setCoupons(coupons.map((c) => (c.id === data.id ? data : c)));
      setEditCoupon(null);
      setSuccess("Cupón actualizado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar cupón");
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    try {
      await fetchAPI(`/v1/coupons/${id}`, { method: "DELETE" });
      setCoupons(coupons.filter((c) => c.id !== id));
      setSuccess("Cupón eliminado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar cupón");
    }
  };

  const handleCreateCouponType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCouponType) return;
    try {
      const { data } = await fetchAPI<CouponType>("/v1/coupons/types", {
        method: "POST",
        data: editCouponType,
      });
      setCouponTypes([...couponTypes, data]);
      setEditCouponType(null);
      setSuccess("Tipo de cupón creado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear tipo de cupón");
    }
  };

  const handleUpdateCouponType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCouponType?.id) return;
    try {
      const { data } = await fetchAPI<CouponType>(`/v1/coupons/types/${editCouponType.id}`, {
        method: "PUT",
        data: editCouponType,
      });
      setCouponTypes(couponTypes.map((ct) => (ct.id === data.id ? data : ct)));
      setEditCouponType(null);
      setSuccess("Tipo de cupón actualizado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar tipo de cupón");
    }
  };

  const handleDeleteCouponType = async (id: number) => {
    try {
      await fetchAPI(`/v1/coupons/types/${id}`, { method: "DELETE" });
      setCouponTypes(couponTypes.filter((ct) => ct.id !== id));
      setSuccess("Tipo de cupón eliminado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar tipo de cupón");
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !broadcastMessage.trim()) return;
    try {
      socket.emit("adminBroadcast", { message: broadcastMessage }, (response: any) => {
        if (response.status === "Broadcast enviado") {
          setSuccess("Mensaje enviado a todos los usuarios");
          setBroadcastMessage("");
        } else {
          setError(response.error || "Error al enviar el mensaje");
        }
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el mensaje");
    }
  };

  const toggleAllSettings = () => {
    const newState = !allSettingsExpanded;
    setAllSettingsExpanded(newState);
    setExpandedSettings(
      Object.keys(expandedSettings).reduce((acc, tag) => {
        acc[tag] = newState;
        return acc;
      }, {} as Record<string, boolean>)
    );
  };

  if (loading || !user || user.rol !== "admin") {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography variant="h6">Cargando...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
            Panel de Administración
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 4 }}>
            Gestiona configuraciones, integraciones, gamificación y más.
          </Typography>
        </motion.div>

        <Paper sx={{ mb: 3, borderRadius: '12px', overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Configuraciones" icon={<Settings />} iconPosition="start" />
            <Tab label="CORS" icon={<Public />} iconPosition="start" />
            <Tab label="Integraciones" icon={<Link />} iconPosition="start" />
            <Tab label="Gamificación" icon={<EmojiEvents />} iconPosition="start" />
            <Tab label="Proveedores de Pago" icon={<MonetizationOn />} iconPosition="start" />
            <Tab label="Cupones" icon={<LocalActivity />} iconPosition="start" />
            <Tab label="Broadcast" icon={<Send />} iconPosition="start" />
          </Tabs>
        </Paper>

        {activeTab === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ConfigGlassCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Configuraciones del Sistema
                    </Typography>
                    <Button
                      onClick={toggleAllSettings}
                      variant="outlined"
                      sx={{ mb: 2 }}
                    >
                      {allSettingsExpanded ? "Colapsar Todo" : "Expandir Todo"}
                    </Button>
                    {Object.entries(settingsByTag).map(([tag, settings]) => (
                      <Accordion
                        key={tag}
                        expanded={expandedSettings[tag] || false}
                        onChange={() =>
                          setExpandedSettings({
                            ...expandedSettings,
                            [tag]: !expandedSettings[tag],
                          })
                        }
                        sx={{ background: "transparent", boxShadow: "none" }}
                      >
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography variant="subtitle1">{tag}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <List>
                            {settings.map((setting) => (
                              <ListItem key={setting.key}>
                                <TextField
                                  label={setting.key}
                                  value={setting.value}
                                  onChange={(e) =>
                                    handleSaveSetting(setting.key, e.target.value)
                                  }
                                  fullWidth
                                  variant="outlined"
                                  size="small"
                                />
                              </ListItem>
                            ))}
                          </List>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </CardContent>
                </ConfigGlassCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <ConfigGlassCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Funcionalidades
                    </Typography>
                    <Grid container spacing={2}>
                      {Object.entries(features).map(([key, value]) => (
                        <Grid item xs={12} sm={6} key={key}>
                          <FeatureCard>
                            <CardContent>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={value}
                                    onChange={(e) =>
                                      handleToggleFeature(
                                        key as keyof typeof features,
                                        e.target.checked
                                      )
                                    }
                                    color="primary"
                                  />
                                }
                                label={key.replace(/_/g, " ")}
                              />
                            </CardContent>
                          </FeatureCard>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </ConfigGlassCard>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {activeTab === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <ConfigGlassCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Configuración de CORS
                </Typography>
                {corsEnabled !== null && (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={corsEnabled}
                        onChange={handleToggleCors}
                        color="primary"
                      />
                    }
                    label="Habilitar CORS"
                  />
                )}
                {corsEnabled && (
                  <>
                    <Box component="form" onSubmit={handleAddOrigin} sx={{ mb: 2, display: 'flex', gap: 2 }}>
                      <TextField
                        label="Nuevo Origen"
                        value={newOrigin}
                        onChange={(e) => setNewOrigin(e.target.value)}
                        fullWidth
                        variant="outlined"
                        size="small"
                      />
                      <Button type="submit" variant="contained" startIcon={<AddCircle />}>
                        Añadir
                      </Button>
                    </Box>
                    <List>
                      {origins.map((origin) => (
                        <ListItem
                          key={origin}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() => handleDeleteOrigin(origin)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          }
                        >
                          <ListItemText primary={origin} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </ConfigGlassCard>
          </motion.div>
        )}

        {activeTab === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <ConfigGlassCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Integraciones
                </Typography>
                <Box component="form" onSubmit={handleAddIntegration} sx={{ mb: 3, display: 'flex', gap: 2 }}>
                  <TextField
                    label="Nombre"
                    value={newIntegration.name}
                    onChange={(e) =>
                      setNewIntegration({ ...newIntegration, name: e.target.value })
                    }
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    label="Webhook URL"
                    value={newIntegration.webhook_url}
                    onChange={(e) =>
                      setNewIntegration({
                        ...newIntegration,
                        webhook_url: e.target.value,
                      })
                    }
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    label="Tipo de Evento"
                    value={newIntegration.event_type}
                    onChange={(e) =>
                      setNewIntegration({
                        ...newIntegration,
                        event_type: e.target.value,
                      })
                    }
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                  <Button type="submit" variant="contained" startIcon={<AddCircle />}>
                    Añadir
                  </Button>
                </Box>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {integrations.map((integration) => (
                      <TableRow key={integration.id}>
                        <TableCell>{integration.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={integration.active ? "Activo" : "Inactivo"}
                            color={integration.active ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleToggleIntegration(integration.id)}
                            color={integration.active ? "default" : "success"}
                          >
                            {integration.active ? <Cancel /> : <CheckCircle />}
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteIntegration(integration.id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </ConfigGlassCard>
          </motion.div>
        )}

        {activeTab === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ConfigGlassCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Tipos de Eventos
                    </Typography>
                    <Button
                      onClick={() =>
                        setEditEventType({
                          id: 0,
                          name: "",
                          description: "",
                          points_per_event: 0,
                        })
                      }
                      variant="contained"
                      startIcon={<AddCircle />}
                      sx={{ mb: 2 }}
                    >
                      Nuevo Tipo
                    </Button>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nombre</TableCell>
                          <TableCell>Puntos</TableCell>
                          <TableCell>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {eventTypes.map((et) => (
                          <TableRow key={et.id}>
                            <TableCell>{et.name}</TableCell>
                            <TableCell>{et.points_per_event}</TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => setEditEventType(et)}
                                color="primary"
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteEventType(et.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </ConfigGlassCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <ConfigGlassCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Insignias
                    </Typography>
                    <Button
                      onClick={() =>
                        setEditBadge({
                          id: 0,
                          name: "",
                          description: "",
                          event_type_id: eventTypes[0]?.id || 0,
                          required_points: 0,
                          user_type: "both",
                        })
                      }
                      variant="contained"
                      startIcon={<AddCircle />}
                      sx={{ mb: 2 }}
                    >
                      Nueva Insignia
                    </Button>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nombre</TableCell>
                          <TableCell>Puntos Requeridos</TableCell>
                          <TableCell>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {badges.map((badge) => (
                          <TableRow key={badge.id}>
                            <TableCell>{badge.name}</TableCell>
                            <TableCell>{badge.required_points}</TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => setEditBadge(badge)}
                                color="primary"
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteBadge(badge.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </ConfigGlassCard>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {activeTab === 4 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <ConfigGlassCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Proveedores de Pago
                </Typography>
                <Button
                  onClick={() =>
                    setEditPaymentProvider({
                      id: 0,
                      name: "",
                      active: false,
                      // Removed 'config' as it does not exist in the PaymentProvider type
                    })
                  }
                  variant="contained"
                  startIcon={<AddCircle />}
                  sx={{ mb: 2 }}
                >
                  Nuevo Proveedor
                </Button>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nombre</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paymentProviders.map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell>{provider.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={provider.active ? "Activo" : "Inactivo"}
                            color={provider.active ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            onClick={() => handleTogglePaymentProvider(provider.id)}
                            color={provider.active ? "default" : "success"}
                          >
                            {provider.active ? <Cancel /> : <CheckCircle />}
                          </IconButton>
                          <IconButton
                            onClick={() => setEditPaymentProvider(provider)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </ConfigGlassCard>
          </motion.div>
        )}

        {activeTab === 5 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <ConfigGlassCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Cupones
                    </Typography>
                    <Button
                      onClick={() =>
                        setEditCoupon({
                                                  id: 0,
                                                  name: "",
                                                  credits: 0,
                                                  status: "active",
                                                  type_id: couponTypes[0]?.id || 0,
                                                  expires_at: "",
                                                  unique_identifier: "",
                                                  issued_at: new Date().toISOString(),
                                                  active: true,
                                                })
                      }
                      variant="contained"
                      startIcon={<AddCircle />}
                      sx={{ mb: 2 }}
                    >
                      Nuevo Cupón
                    </Button>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nombre</TableCell>
                          <TableCell>Créditos</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {coupons.map((coupon) => (
                          <TableRow key={coupon.id}>
                            <TableCell>{coupon.name}</TableCell>
                            <TableCell>{coupon.credits}</TableCell>
                            <TableCell>
                              <Chip
                                label={coupon.status}
                                color={coupon.status === "active" ? "success" : "default"}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => setEditCoupon(coupon)}
                                color="primary"
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteCoupon(coupon.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </ConfigGlassCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <ConfigGlassCard>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Tipos de Cupones
                    </Typography>
                    <Button
                      onClick={() =>
                        setEditCouponType({ id: 0, name: "", description: "", credits: 0, active: true })
                      }
                      variant="contained"
                      startIcon={<AddCircle />}
                      sx={{ mb: 2 }}
                    >
                      Nuevo Tipo
                    </Button>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nombre</TableCell>
                          <TableCell>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {couponTypes.map((type) => (
                          <TableRow key={type.id}>
                            <TableCell>{type.name}</TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => setEditCouponType(type)}
                                color="primary"
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteCouponType(type.id)}
                                color="error"
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </ConfigGlassCard>
              </Grid>
            </Grid>
          </motion.div>
        )}

        {activeTab === 6 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <ConfigGlassCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Enviar Mensaje Global
                </Typography>
                <Box component="form" onSubmit={handleSendBroadcast} sx={{ mb: 3, display: 'flex', gap: 2 }}>
                  <TextField
                    label="Mensaje"
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                    multiline
                    rows={4}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Send />}
                    disabled={!broadcastMessage.trim()}
                  >
                    Enviar Broadcast
                  </Button>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Este mensaje será enviado a todos los usuarios conectados en tiempo real.
                </Typography>
              </CardContent>
            </ConfigGlassCard>
          </motion.div>
        )}

        <Dialog open={!!editEventType} onClose={() => setEditEventType(null)}>
          <DialogTitle>{editEventType?.id ? "Editar Tipo de Evento" : "Crear Tipo de Evento"}</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={editEventType?.id ? handleUpdateEventType : handleCreateEventType} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre"
                value={editEventType?.name || ""}
                onChange={(e) =>
                  setEditEventType({ ...editEventType!, name: e.target.value })
                }
                fullWidth
                required
                variant="outlined"
                size="small"
              />
              <TextField
                label="Descripción"
                value={editEventType?.description || ""}
                onChange={(e) =>
                  setEditEventType({ ...editEventType!, description: e.target.value })
                }
                fullWidth
                variant="outlined"
                size="small"
              />
              <TextField
                label="Puntos por Evento"
                type="number"
                value={editEventType?.points_per_event || 0}
                onChange={(e) =>
                  setEditEventType({
                    ...editEventType!,
                    points_per_event: parseInt(e.target.value),
                  })
                }
                fullWidth
                required
                variant="outlined"
                size="small"
              />
              <DialogActions>
                <Button onClick={() => setEditEventType(null)} variant="outlined">
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {editEventType?.id ? "Actualizar" : "Crear"}
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editBadge} onClose={() => setEditBadge(null)}>
          <DialogTitle>{editBadge?.id ? "Editar Insignia" : "Crear Insignia"}</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={editBadge?.id ? handleUpdateBadge : handleCreateBadge} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre"
                value={editBadge?.name || ""}
                onChange={(e) =>
                  setEditBadge({ ...editBadge!, name: e.target.value })
                }
                fullWidth
                required
                variant="outlined"
                size="small"
              />
              <TextField
                label="Descripción"
                value={editBadge?.description || ""}
                onChange={(e) =>
                  setEditBadge({ ...editBadge!, description: e.target.value })
                }
                fullWidth
                variant="outlined"
                size="small"
              />
              <TextField
                label="Puntos Requeridos"
                type="number"
                value={editBadge?.required_points || 0}
                onChange={(e) =>
                  setEditBadge({
                    ...editBadge!,
                    required_points: parseInt(e.target.value),
                  })
                }
                fullWidth
                required
                variant="outlined"
                size="small"
              />
              <Select
                label="Tipo de Evento"
                value={editBadge?.event_type_id || ""}
                onChange={(e) =>
                  setEditBadge({
                    ...editBadge!,
                    event_type_id: parseInt(e.target.value as string),
                  })
                }
                fullWidth
                required
                variant="outlined"
                size="small"
              >
                {eventTypes.map((et) => (
                  <MenuItem key={et.id} value={et.id}>
                    {et.name}
                  </MenuItem>
                ))}
              </Select>
              <Select
                label="Tipo de Usuario"
                value={editBadge?.user_type || "both"}
                onChange={(e) =>
                  setEditBadge({ ...editBadge!, user_type: e.target.value as string })
                }
                fullWidth
                required
                variant="outlined"
                size="small"
              >
                <MenuItem value="registered">Registrado</MenuItem>
                <MenuItem value="anonymous">Anónimo</MenuItem>
                <MenuItem value="both">Ambos</MenuItem>
              </Select>
              <DialogActions>
                <Button onClick={() => setEditBadge(null)} variant="outlined">
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {editBadge?.id ? "Actualizar" : "Crear"}
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editPaymentProvider} onClose={() => setEditPaymentProvider(null)}>
          <DialogTitle>{editPaymentProvider?.id ? "Editar Proveedor" : "Crear Proveedor"}</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={editPaymentProvider?.id ? handleUpdatePaymentProvider : handleCreatePaymentProvider} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre"
                value={editPaymentProvider?.name || ""}
                onChange={(e) =>
                  setEditPaymentProvider({
                    ...editPaymentProvider!,
                    name: e.target.value,
                  })
                }
                fullWidth
                required
                variant="outlined"
                size="small"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={editPaymentProvider?.active || false}
                    onChange={(e) =>
                      setEditPaymentProvider({
                        ...editPaymentProvider!,
                        active: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label="Activo"
              />
              <DialogActions>
                <Button onClick={() => setEditPaymentProvider(null)} variant="outlined">
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {editPaymentProvider?.id ? "Actualizar" : "Crear"}
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editCoupon} onClose={() => setEditCoupon(null)}>
          <DialogTitle>{editCoupon?.id ? "Editar Cupón" : "Crear Cupón"}</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={editCoupon?.id ? handleUpdateCoupon : handleCreateCoupon} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre"
                value={editCoupon?.name || ""}
                onChange={(e) =>
                  setEditCoupon({ ...editCoupon!, name: e.target.value })
                }
                fullWidth
                required
                variant="outlined"
                size="small"
              />
              <TextField
                label="Créditos"
                type="number"
                value={editCoupon?.credits || 0}
                onChange={(e) =>
                  setEditCoupon({
                    ...editCoupon!,
                    credits: parseInt(e.target.value),
                  })
                }
                fullWidth
                required
                variant="outlined"
                size="small"
              />
              <Select
                label="Estado"
                value={editCoupon?.status || "active"}
                onChange={(e) =>
                  setEditCoupon({ ...editCoupon!, status: e.target.value as "active" | "disabled" | "redeemed" | "expired" })
                }
                fullWidth
                required
                variant="outlined"
                size="small"
              >
                <MenuItem value="active">Activo</MenuItem>
                <MenuItem value="inactive">Inactivo</MenuItem>
              </Select>
              <Select
                label="Tipo de Cupón"
                value={editCoupon?.type_id || ""}
                onChange={(e) =>
                  setEditCoupon({
                    ...editCoupon!,
                    type_id: parseInt(e.target.value as string),
                  })
                }
                fullWidth
                required
                variant="outlined"
                size="small"
              >
                {couponTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    {type.name}
                  </MenuItem>
                ))}
              </Select>
              <TextField
                label="Expira en"
                type="datetime-local"
                value={editCoupon?.expires_at || ""}
                onChange={(e) =>
                  setEditCoupon({ ...editCoupon!, expires_at: e.target.value })
                }
                fullWidth
                variant="outlined"
                size="small"
                InputLabelProps={{ shrink: true }}
              />
              <DialogActions>
                <Button onClick={() => setEditCoupon(null)} variant="outlined">
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {editCoupon?.id ? "Actualizar" : "Crear"}
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>

        <Dialog open={!!editCouponType} onClose={() => setEditCouponType(null)}>
          <DialogTitle>{editCouponType?.id ? "Editar Tipo de Cupón" : "Crear Tipo de Cupón"}</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={editCouponType?.id ? handleUpdateCouponType : handleCreateCouponType} sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Nombre"
                value={editCouponType?.name || ""}
                onChange={(e) =>
                  setEditCouponType({ ...editCouponType!, name: e.target.value })
                }
                fullWidth
                required
                variant="outlined"
                size="small"
              />
              <TextField
                label="Descripción"
                value={editCouponType?.description || ""}
                onChange={(e) =>
                  setEditCouponType({
                    ...editCouponType!,
                    description: e.target.value,
                  })
                }
                fullWidth
                variant="outlined"
                size="small"
              />
              <DialogActions>
                <Button onClick={() => setEditCouponType(null)} variant="outlined">
                  Cancelar
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  {editCouponType?.id ? "Actualizar" : "Crear"}
                </Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>

        <AnimatePresence>
          {error && (
            <Snackbar
              open
              autoHideDuration={3000}
              onClose={() => setError(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Alert severity="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              </motion.div>
            </Snackbar>
          )}
          {success && (
            <Snackbar
              open
              autoHideDuration={3000}
              onClose={() => setSuccess(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Alert severity="success" onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              </motion.div>
            </Snackbar>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}