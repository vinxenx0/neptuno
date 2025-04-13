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
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Badge as MuiBadge,
  Paper,
  useTheme,
  styled,
  Box,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  AddCircle,
  Delete,
  ExpandMore,
  Settings,
  Public,
  Link,
  Webhook,
  CheckCircle,
  Cancel,
  Security,
  PersonAdd,
  LockPerson,
  PeopleOutline,
  AttachMoney,
  Edit,
  EmojiEvents,
  MonetizationOn,
  LocalActivity
} from "@mui/icons-material";
import { SiteSetting, Integration, EventType, Badge, PaymentProvider, Coupon, CouponType } from "@/lib/types";

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
  '&:hover': {
    transform: 'translateY(-5px)'
  }
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
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8]
  }
}));

export default function ConfigurePage() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [settingsByTag, setSettingsByTag] = useState<Record<string, SiteSetting[]>>({});
  const [origins, setOrigins] = useState<string[]>([]); // Inicializar como array vacío
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
  const [corsEnabled, setCorsEnabled] = useState(true);


  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await fetchAPI<PaymentProvider[]>("/v1/payment-providers");
        setPaymentProviders(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar proveedores");
      }
    };
    fetchData();
  }, []);



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

        // Initialize expanded state for settings
        if (grouped) {
          const initialExpandedState = Object.keys(grouped).reduce((acc, tag) => {
            acc[tag] = false;
            return acc;
          }, {} as Record<string, boolean>);
          setExpandedSettings(initialExpandedState);
        }

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
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, router]);

  useEffect(() => {
    const fetchCorsSettings = async () => {
      try {
        console.log("Fetching CORS settings..."); // Depuración
        const { data: corsEnabledData } = await fetchAPI("/v1/settings/allowed_origins");
        console.log("CORS enabled data:", corsEnabledData); // Depuración
        const enabled = corsEnabledData === "true";
        setCorsEnabled(enabled);

        console.log("Fetching origins..."); // Depuración
        const { data: originsData } = await fetchAPI<AllowedOrigin[]>("/v1/origins");
        console.log("Origins data:", originsData); // Depuración
        setOrigins(Array.isArray(originsData) ? originsData.map(o => o.origin) : []);
      } catch (err) {
        console.error("Error fetching CORS settings or origins:", err); // Depuración
        setError(err instanceof Error ? err.message : "Error al cargar configuración de CORS");
      }
    };
    fetchCorsSettings();
  }, []); // Cambiar dependencia a [] para que solo se ejecute una vez al montar el componente

  // Asegurarse de que origins sea siempre un array válido
  useEffect(() => {
    if (!Array.isArray(origins)) {
      setOrigins([]);
    }
  }, [origins]);

  const handleToggleCors = async () => {
    try {
      const { data } = await fetchAPI<{ key: string; value: boolean }>("/v1/settings/admin/config", {
        method: "POST",
        data: { key: "allowed_origins", value: !corsEnabled },
      });
      setCorsEnabled(data!.value);
      setSuccess(`CORS ${data!.value ? "activado" : "desactivado"}`);
      refreshOrigins(); // Asegurar que se refresque la lista de orígenes después de cambiar el estado de CORS
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar CORS");
    }
  };


  //const handleToggleIntegration = async (id: number, active: boolean) => {
  //  await fetchAPI(`/v1/integrations/${id}/toggle`, { method: "PUT" });
  // Actualizar estado local
  //};

  const groupedBadges = badges.reduce((acc, badge) => {
    const key = badge.event_type_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(badge);
    return acc;
  }, {} as Record<number, Badge[]>);

  const toggleAllSettings = () => {
    const newState = !allSettingsExpanded;
    setAllSettingsExpanded(newState);
    const updatedExpandedSettings = Object.keys(expandedSettings).reduce((acc, tag) => {
      acc[tag] = newState;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedSettings(updatedExpandedSettings);
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
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar configuración");
    }
  };

  const refreshOrigins = async () => {
    try {
      console.log("Refreshing origins..."); // Depuración
      const { data: originsData } = await fetchAPI<AllowedOrigin[]>("/v1/origins");
      console.log("Refreshed origins data:", originsData); // Depuración
      setOrigins(Array.isArray(originsData) ? originsData.map(o => o.origin) : []);
    } catch (err) {
      console.error("Error refreshing origins:", err); // Depuración
      setError(err instanceof Error ? err.message : "Error al refrescar orígenes");
    }
  };

  const handleAddOrigin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI("/v1/settings/allowed-origins", { method: "POST", data: { origin: newOrigin } });
      setNewOrigin("");
      setSuccess("Origen añadido con éxito");
      refreshOrigins(); // Refrescar la lista de orígenes
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al añadir origen");
    }
  };

  const handleDeleteOrigin = async (origin: string) => {
    try {
      await fetchAPI(`/v1/settings/allowed-origins/${encodeURIComponent(origin)}`, { method: "DELETE" });
      setSuccess("Origen eliminado con éxito");
      refreshOrigins(); // Refrescar la lista de orígenes
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
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear integración");
    }
  };

  const handleToggleIntegration = async (id: number, active: boolean) => {
    try {
      const { data } = await fetchAPI<{ id: number; active: boolean }>(`/v1/integrations/${id}/toggle`, {
        method: "PUT",
      });
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === id ? { ...integration, active: data!.active } : integration
        )
      );
      setSuccess(`Integración ${data!.active ? "activada" : "desactivada"}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar integración");
    }
  };

  const handleDeleteIntegration = async (id: number) => {
    try {
      await fetchAPI(`/v1/integrations/${id}`, { method: "DELETE" });
      setIntegrations(integrations.filter(i => i.id !== id));
      setSuccess("Integración eliminada con éxito");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar integración");
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
    e.preventDefault();
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
      setEventTypes(eventTypes.filter((et) => (et.id !== id)));
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
    e.preventDefault();
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
      const provider = paymentProviders.find(p => p.id === id);
      if (!provider) throw new Error("Proveedor no encontrado");
      const updatedProvider = { ...provider, active: !active }; // Invertir el estado
      const { data } = await fetchAPI<PaymentProvider>(`/v1/payment-providers/${id}`, {
        method: "PUT",
        data: updatedProvider,
      });
      setPaymentProviders(paymentProviders.map((p) => (p.id === data!.id ? data! : p)));
      setSuccess(`Proveedor ${!active ? "activado" : "desactivado"}`);
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
    e.preventDefault();
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


  // Funciones para manejar cupones
  const handleSubmitCouponType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCouponType) return;
    try {
      if (editCouponType.id) {
        const { data } = await fetchAPI<CouponType>(`/v1/coupons/types/${editCouponType.id}`, {
          method: "PUT",
          data: editCouponType,
        });
        setCouponTypes(couponTypes.map(ct => ct.id === data!.id ? data! : ct));
      } else {
        const { data } = await fetchAPI<CouponType>("/v1/coupons/types", {
          method: "POST",
          data: editCouponType,
        });
        setCouponTypes([...couponTypes, data!]);
      }
      setEditCouponType(null);
      setSuccess("Tipo de cupón guardado con éxito");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar tipo de cupón");
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    try {
      await fetchAPI(`/v1/coupons/${id}`, { method: "DELETE" });
      setCoupons(coupons.filter((c) => c.id !== id));
      setSuccess("Cupón eliminado con éxito");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar cupón");
    }
  };

  if (loading) return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h6" color="textSecondary">Cargando panel de administración...</Typography>
      </motion.div>
    </Box>
  );


  return (
    <Box sx={{
      p: { xs: 2, md: 4 },
      minHeight: "100vh",
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header Section */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          gap: 2
        }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              Panel de Administración
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Gestiona la configuración del sistema
            </Typography>
          </motion.div>

          <MuiBadge
            overlap="circular"
            badgeContent={
              <Chip
                label="Admin"
                size="small"
                color="primary"
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  fontWeight: 'bold'
                }}
              />
            }
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: theme.palette.error.main,
                fontSize: '2rem',
                boxShadow: theme.shadows[6]
              }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </MuiBadge>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <AdminGradientCard sx={{ flex: 1, minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>
                    Configuraciones
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {Object.values(settingsByTag).flat().length}
                  </Typography>
                </Box>
                <Settings sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </AdminGradientCard>

          <AdminGradientCard sx={{ flex: 1, minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>
                    Orígenes Permitidos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {origins.length}
                  </Typography>
                </Box>
                <Public sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </AdminGradientCard>

          <AdminGradientCard sx={{ flex: 1, minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>
                    Integraciones
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {integrations.length}
                  </Typography>
                </Box>
                <Webhook sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </AdminGradientCard>

          <AdminGradientCard sx={{ flex: 1, minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>
                    Gamificación
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {eventTypes.length}
                  </Typography>
                </Box>
                <EmojiEvents sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </AdminGradientCard>

          <AdminGradientCard sx={{ flex: 1, minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>
                    Pagos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {paymentProviders.length}
                  </Typography>
                </Box>
                <MonetizationOn sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </AdminGradientCard>
        </Box>

        {/* Tabs Navigation */}
        <Paper sx={{ mb: 3, borderRadius: '12px', overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Funcionalidades" icon={<LockPerson />} iconPosition="start" />
            <Tab label="Orígenes" icon={<Security />} iconPosition="start" />
            <Tab label="Integraciones" icon={<Link />} iconPosition="start" />
            <Tab label="Gamificación" icon={<EmojiEvents />} iconPosition="start" />
            <Tab label="Cupones" icon={<LocalActivity />} iconPosition="start" />
            <Tab label="Pagos" icon={<MonetizationOn />} iconPosition="start" />
            <Tab label="Configuraciones" icon={<Settings />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Funcionalidades Tab */}
          {activeTab === 0 && (
            <Box sx={{ mb: 4 }}>
              <ConfigGlassCard>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                    <LockPerson sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Control de Funcionalidades del Sistema
                  </Typography>

                  <Grid container spacing={3}>
                    {/* Tarjeta para Registro */}
                    <Grid item xs={12} md={6} lg={4}>
                      <FeatureCard sx={{
                        borderLeft: `4px solid ${features.enable_registration ? theme.palette.success.main : theme.palette.error.main}`
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PersonAdd sx={{
                              fontSize: 40,
                              mr: 2,
                              color: features.enable_registration ? theme.palette.success.main : theme.palette.error.main
                            }} />
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Registro de Usuarios</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Controla si los nuevos usuarios pueden registrarse
                              </Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ my: 2 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" component="span">
                                Estado actual:
                              </Typography>
                              <Chip
                                label={features.enable_registration ? "Activado" : "Desactivado"}
                                size="small"
                                color={features.enable_registration ? "success" : "error"}
                                sx={{ ml: 1 }}
                              />
                            </Box>
                            <Switch
                              checked={features.enable_registration}
                              onChange={(e) => handleToggleFeature('enable_registration', e.target.checked)}
                              color="primary"
                            />
                          </Box>
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            {getFeatureDescription('enable_registration')}
                          </Typography>
                        </CardContent>
                      </FeatureCard>
                    </Grid>

                    {/* Tarjeta para Login Social */}
                    <Grid item xs={12} md={6} lg={4}>
                      <FeatureCard sx={{
                        borderLeft: `4px solid ${features.enable_social_login ? theme.palette.success.main : theme.palette.error.main}`
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <PeopleOutline sx={{
                              fontSize: 40,
                              mr: 2,
                              color: features.enable_social_login ? theme.palette.success.main : theme.palette.error.main
                            }} />
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Login Social</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Permite inicio de sesión con redes sociales
                              </Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ my: 2 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" component="span">
                                Estado actual:
                              </Typography>
                              <Chip
                                label={features.enable_social_login ? "Activado" : "Desactivado"}
                                size="small"
                                color={features.enable_social_login ? "success" : "error"}
                                sx={{ ml: 1 }}
                              />
                            </Box>
                            <Switch
                              checked={features.enable_social_login}
                              onChange={(e) => handleToggleFeature('enable_social_login', e.target.checked)}
                              color="primary"
                            />
                          </Box>
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            {getFeatureDescription('enable_social_login')}
                          </Typography>
                        </CardContent>
                      </FeatureCard>
                    </Grid>

                    {/* Tarjeta para Usuarios Anónimos */}
                    <Grid item xs={12} md={6} lg={4}>
                      <FeatureCard sx={{
                        borderLeft: `4px solid ${features.disable_anonymous_users ? theme.palette.error.main : theme.palette.success.main}`
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Security sx={{
                              fontSize: 40,
                              mr: 2,
                              color: features.disable_anonymous_users ? theme.palette.error.main : theme.palette.success.main
                            }} />
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Usuarios Anónimos</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Controla el acceso de usuarios no registrados
                              </Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ my: 2 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" component="span">
                                Estado actual:
                              </Typography>
                              <Chip
                                label={features.disable_anonymous_users ? "Bloqueados" : "Permitidos"}
                                size="small"
                                color={features.disable_anonymous_users ? "error" : "success"}
                                sx={{ ml: 1 }}
                              />
                            </Box>
                            <Switch
                              checked={features.disable_anonymous_users}
                              onChange={(e) => handleToggleFeature('disable_anonymous_users', e.target.checked)}
                              color="primary"
                            />
                          </Box>
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            {getFeatureDescription('disable_anonymous_users')}
                          </Typography>
                        </CardContent>
                      </FeatureCard>
                    </Grid>

                    {/* Tarjeta para Sistema de Créditos */}
                    <Grid item xs={12} md={6} lg={4}>
                      <FeatureCard sx={{
                        borderLeft: `4px solid ${features.disable_credits ? theme.palette.error.main : theme.palette.success.main}`
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <AttachMoney sx={{
                              fontSize: 40,
                              mr: 2,
                              color: features.disable_credits ? theme.palette.error.main : theme.palette.success.main
                            }} />
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Sistema de Créditos</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Habilita/deshabilita el uso de créditos
                              </Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ my: 2 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" component="span">
                                Estado actual:
                              </Typography>
                              <Chip
                                label={features.disable_credits ? "Desactivado" : "Activado"}
                                size="small"
                                color={features.disable_credits ? "error" : "success"}
                                sx={{ ml: 1 }}
                              />
                            </Box>
                            <Switch
                              checked={!features.disable_credits}
                              onChange={(e) => handleToggleFeature('disable_credits', !e.target.checked)}
                              color="primary"
                            />
                          </Box>
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            {getFeatureDescription('disable_credits')}
                          </Typography>
                        </CardContent>
                      </FeatureCard>
                    </Grid>

                    {/* Tarjeta para Métodos de Pago */}
                    <Grid item xs={12} md={6} lg={4}>
                      <FeatureCard sx={{
                        borderLeft: `4px solid ${features.enable_payment_methods ? theme.palette.success.main : theme.palette.error.main}`
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <MonetizationOn sx={{
                              fontSize: 40,
                              mr: 2,
                              color: features.enable_payment_methods ? theme.palette.success.main : theme.palette.error.main
                            }} />
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Métodos de Pago</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Habilita diferentes opciones de pago
                              </Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ my: 2 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" component="span">
                                Estado actual:
                              </Typography>
                              <Chip
                                label={features.enable_payment_methods ? "Activado" : "Desactivado"}
                                size="small"
                                color={features.enable_payment_methods ? "success" : "error"}
                                sx={{ ml: 1 }}
                              />
                            </Box>
                            <Switch
                              checked={features.enable_payment_methods}
                              onChange={(e) => handleToggleFeature('enable_payment_methods', e.target.checked)}
                              color="primary"
                            />
                          </Box>
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            {getFeatureDescription('enable_payment_methods')}
                          </Typography>
                        </CardContent>
                      </FeatureCard>
                    </Grid>

                    {/* Tarjeta para Sistema de Puntos */}
                    <Grid item xs={12} md={6} lg={4}>
                      <FeatureCard sx={{
                        borderLeft: `4px solid ${features.enable_points ? theme.palette.success.main : theme.palette.error.main}`
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <EmojiEvents sx={{
                              fontSize: 40,
                              mr: 2,
                              color: features.enable_points ? theme.palette.success.main : theme.palette.error.main
                            }} />
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Sistema de Puntos</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Activa puntos por actividades
                              </Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ my: 2 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" component="span">
                                Estado actual:
                              </Typography>
                              <Chip
                                label={features.enable_points ? "Activado" : "Desactivado"}
                                size="small"
                                color={features.enable_points ? "success" : "error"}
                                sx={{ ml: 1 }}
                              />
                            </Box>
                            <Switch
                              checked={features.enable_points}
                              onChange={(e) => handleToggleFeature('enable_points', e.target.checked)}
                              color="primary"
                            />
                          </Box>
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            {getFeatureDescription('enable_points')}
                          </Typography>
                        </CardContent>
                      </FeatureCard>
                    </Grid>

                    {/* Tarjeta para Insignias */}
                    <Grid item xs={12} md={6} lg={4}>
                      <FeatureCard sx={{
                        borderLeft: `4px solid ${features.enable_badges ? theme.palette.success.main : theme.palette.error.main}`
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <EmojiEvents sx={{
                              fontSize: 40,
                              mr: 2,
                              color: features.enable_badges ? theme.palette.success.main : theme.palette.error.main
                            }} />
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Sistema de Insignias</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Permite la obtención de insignias
                              </Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ my: 2 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" component="span">
                                Estado actual:
                              </Typography>
                              <Chip
                                label={features.enable_badges ? "Activado" : "Desactivado"}
                                size="small"
                                color={features.enable_badges ? "success" : "error"}
                                sx={{ ml: 1 }}
                              />
                            </Box>
                            <Switch
                              checked={features.enable_badges}
                              onChange={(e) => handleToggleFeature('enable_badges', e.target.checked)}
                              color="primary"
                            />
                          </Box>
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            {getFeatureDescription('enable_badges')}
                          </Typography>
                        </CardContent>
                      </FeatureCard>
                    </Grid>

                    {/* Tarjeta para Cupones */}
                    <Grid item xs={12} md={6} lg={4}>
                      <FeatureCard sx={{
                        borderLeft: `4px solid ${features.enable_coupons ? theme.palette.success.main : theme.palette.error.main}`
                      }}>
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <EmojiEvents sx={{
                              fontSize: 40,
                              mr: 2,
                              color: features.enable_coupons ? theme.palette.success.main : theme.palette.error.main
                            }} />
                            <Box>
                              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Cupones</Typography>
                              <Typography variant="body2" color="textSecondary">
                                Habilita el sistema de cupones
                              </Typography>
                            </Box>
                          </Box>
                          <Divider sx={{ my: 2 }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2" component="span">
                                Estado actual:
                              </Typography>
                              <Chip
                                label={features.enable_coupons ? "Activado" : "Desactivado"}
                                size="small"
                                color={features.enable_coupons ? "success" : "error"}
                                sx={{ ml: 1 }}
                              />
                            </Box>
                            <Switch
                              checked={features.enable_coupons}
                              onChange={(e) => handleToggleFeature('enable_coupons', e.target.checked)}
                              color="primary"
                            />
                          </Box>
                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                            {getFeatureDescription('enable_coupons')}
                          </Typography>
                        </CardContent>
                      </FeatureCard>
                    </Grid>

                  </Grid>
                </CardContent>
              </ConfigGlassCard>
            </Box>
          )}

          {/* Orígenes Permitidos Tab */}
          {activeTab === 1 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">Orígenes Permitidos</Typography>
                <Switch checked={corsEnabled} onChange={handleToggleCors} />
              </Box>
              {corsEnabled && (
                <Box component="form" onSubmit={handleAddOrigin} sx={{ mb: 2 }}>
                  <TextField
                    label="Nuevo Origen"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                  <Button type="submit" variant="contained" color="primary" sx={{ mt: 1 }}>
                    Añadir Origen
                  </Button>
                </Box>
              )}
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Origen</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(origins || []).map((origin) => (
                    <TableRow key={origin}>
                      <TableCell>{origin}</TableCell>
                      <TableCell>
                        {corsEnabled ? (
                          <IconButton onClick={() => handleDeleteOrigin(origin)} color="error">
                            <Delete />
                          </IconButton>
                        ) : (
                          <Typography color="textSecondary">Desactivado</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* Integraciones Tab */}
          {activeTab === 2 && (
            <Box>
              <Select
                value={selectedUserId || ""}
                onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
                displayEmpty
                fullWidth
                sx={{ mb: 2 }}
              >
                <MenuItem value="">Todos los usuarios</MenuItem>
                {/* Añadir opciones dinámicas de usuarios */}
              </Select>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Usuario</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {integrations.filter(i => selectedUserId ? i.user_id === selectedUserId : true).map((integration) => (
                    <TableRow key={integration.id}>
                      <TableCell>{integration.name}</TableCell>
                      <TableCell>{integration.user_id}</TableCell>
                      <TableCell>
                        <Switch
                          checked={integration.active}
                          onChange={() => handleToggleIntegration(integration.id, integration.active)}
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleDeleteIntegration(integration.id)} color="error">
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* Gamificación Tab */}
          {activeTab === 3 && (
            <Box sx={{ mb: 4 }}>
              <ConfigGlassCard sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                    <EmojiEvents sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Gestión de Gamificación
                  </Typography>

                  {/* Event Types Section */}
                  <ConfigGlassCard sx={{ mb: 4, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Tipos de Evento</Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddCircle />}
                        onClick={() => setEditEventType({ id: 0, name: '', description: '', points_per_event: 0 })}
                      >
                        Nuevo Tipo
                      </Button>
                    </Box>

                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Nombre</TableCell>
                          <TableCell>Descripción</TableCell>
                          <TableCell>Puntos</TableCell>
                          <TableCell>Acciones</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {eventTypes.map((et) => (
                          <TableRow key={et.id}>
                            <TableCell>{et.name}</TableCell>
                            <TableCell>{et.description}</TableCell>
                            <TableCell>{et.points_per_event}</TableCell>
                            <TableCell>
                              <IconButton onClick={() => setEditEventType(et)} color="primary">
                                <Edit />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteEventType(et.id)} color="error">
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ConfigGlassCard>

                  {/* Badges Section */}
                  <ConfigGlassCard sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">Insignias</Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddCircle />}
                        onClick={() => setEditBadge({
                          id: 0,
                          name: '',
                          description: '',
                          event_type_id: eventTypes[0]?.id || 0,
                          required_points: 0,
                          user_type: 'both'
                        })}
                        disabled={eventTypes.length === 0}
                      >
                        Nueva Insignia
                      </Button>
                    </Box>

                    {eventTypes.map((eventType) => (
                      <Accordion key={eventType.id} sx={{ background: 'transparent', boxShadow: 'none' }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <Typography>{eventType.name} (ID: {eventType.id})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Puntos Requeridos</TableCell>
                                <TableCell>Tipo Usuario</TableCell>
                                <TableCell>Acciones</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(groupedBadges[eventType.id] || []).map((badge) => (
                                <TableRow key={badge.id}>
                                  <TableCell>{badge.name}</TableCell>
                                  <TableCell>{badge.required_points}</TableCell>
                                  <TableCell>{badge.user_type}</TableCell>
                                  <TableCell>
                                    <IconButton onClick={() => setEditBadge(badge)} color="primary">
                                      <Edit />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteBadge(badge.id)} color="error">
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
                  </ConfigGlassCard>
                </CardContent>
              </ConfigGlassCard>

              {/* Event Type Dialog */}
              <Dialog open={!!editEventType} onClose={() => setEditEventType(null)}>
                <DialogTitle>{editEventType?.id ? 'Editar Tipo de Evento' : 'Nuevo Tipo de Evento'}</DialogTitle>
                <DialogContent>
                  <Box component="form" onSubmit={editEventType?.id ? handleUpdateEventType : handleCreateEventType} sx={{ mt: 2 }}>
                    <TextField
                      label="Nombre"
                      fullWidth
                      value={editEventType?.name || ''}
                      onChange={(e) => setEditEventType({ ...editEventType!, name: e.target.value })}
                      margin="normal"
                    />
                    <TextField
                      label="Descripción"
                      fullWidth
                      value={editEventType?.description || ''}
                      onChange={(e) => setEditEventType({ ...editEventType!, description: e.target.value })}
                      margin="normal"
                    />
                    <TextField
                      label="Puntos por evento"
                      type="number"
                      fullWidth
                      value={editEventType?.points_per_event || 0}
                      onChange={(e) => setEditEventType({ ...editEventType!, points_per_event: parseInt(e.target.value) || 0 })}
                      margin="normal"
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      {editEventType?.id ? 'Actualizar' : 'Crear'}
                    </Button>
                  </Box>
                </DialogContent>
              </Dialog>

              {/* Badge Dialog */}
              <Dialog open={!!editBadge} onClose={() => setEditBadge(null)}>
                <DialogTitle>{editBadge?.id ? 'Editar Insignia' : 'Nueva Insignia'}</DialogTitle>
                <DialogContent>
                  <Box component="form" onSubmit={editBadge?.id ? handleUpdateBadge : handleCreateBadge} sx={{ mt: 2 }}>
                    <TextField
                      label="Nombre"
                      fullWidth
                      value={editBadge?.name || ''}
                      onChange={(e) => setEditBadge({ ...editBadge!, name: e.target.value })}
                      margin="normal"
                    />
                    <TextField
                      label="Descripción"
                      fullWidth
                      value={editBadge?.description || ''}
                      onChange={(e) => setEditBadge({ ...editBadge!, description: e.target.value })}
                      margin="normal"
                    />
                    <TextField
                      label="Puntos Requeridos"
                      type="number"
                      fullWidth
                      value={editBadge?.required_points || 0}
                      onChange={(e) => setEditBadge({ ...editBadge!, required_points: parseInt(e.target.value) || 0 })}
                      margin="normal"
                    />
                    <TextField
                      label="Tipo de Evento"
                      select
                      fullWidth
                      value={editBadge?.event_type_id || 0}
                      onChange={(e) => setEditBadge({ ...editBadge!, event_type_id: parseInt(e.target.value) })}
                      margin="normal"
                      SelectProps={{ native: true }}
                    >
                      {eventTypes.map((et) => (
                        <option key={et.id} value={et.id}>{et.name}</option>
                      ))}
                    </TextField>
                    <TextField
                      label="Tipo de Usuario"
                      select
                      fullWidth
                      value={editBadge?.user_type || 'both'}
                      onChange={(e) => setEditBadge({ ...editBadge!, user_type: e.target.value as any })}
                      margin="normal"
                      SelectProps={{ native: true }}
                    >
                      <option value="anonymous">Anónimo</option>
                      <option value="registered">Registrado</option>
                      <option value="both">Ambos</option>
                    </TextField>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      {editBadge?.id ? 'Actualizar' : 'Crear'}
                    </Button>
                  </Box>
                </DialogContent>
              </Dialog>
            </Box>
          )}

          {/* CUpones Tab */}

          {activeTab === 4 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Tipos de Cupones</Typography>
              <Button
                variant="contained"
                startIcon={<AddCircle />}
                onClick={() => setEditCouponType({ id: 0, name: '', description: '', credits: 0, active: true })}
              >
                Nuevo Tipo de Cupón
              </Button>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Créditos</TableCell>
                    <TableCell>Activo</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {couponTypes.map((ct) => (
                    <TableRow key={ct.id}>
                      <TableCell>{ct.name}</TableCell>
                      <TableCell>{ct.description || 'Sin descripción'}</TableCell>
                      <TableCell>{ct.credits}</TableCell>
                      <TableCell>
                        <Chip label={ct.active ? "Activo" : "Inactivo"} color={ct.active ? "success" : "error"} />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => setEditCouponType(ct)} color="primary">
                          <Edit />
                        </IconButton>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<LocalActivity />}
                          onClick={async () => {
                            try {
                              const { data } = await fetchAPI<Coupon>("/v1/coupons/test", {
                                method: "POST",
                                data: { coupon_type_id: ct.id },
                              });
                              if (data) {
                                setCoupons([...coupons, data]);
                                setSuccess("Cupón de prueba generado con éxito");
                                setTimeout(() => setSuccess(null), 3000);
                              }
                            } catch (err) {
                              setError(err instanceof Error ? err.message : "Error al generar cupón de prueba");
                            }
                          }}
                        >
                          Generar Prueba
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}

          {/* Pagos Tab */}
          {activeTab === 5 && (
            <Box sx={{ mb: 4 }}>
              <ConfigGlassCard>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                    <MonetizationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Gestión de Pagos
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddCircle />}
                      onClick={() => setEditPaymentProvider({ id: 0, name: '', active: true })}
                    >
                      Nuevo Proveedor
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
                      {paymentProviders.map((provider) => (
                        <TableRow key={provider.id}>
                          <TableCell>{provider.name}</TableCell>
                          <TableCell>
                            <Switch
                              checked={provider.active}
                              onChange={(e) => handleTogglePaymentProvider(provider.id, provider.active)}
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton onClick={() => setEditPaymentProvider(provider)} color="primary">
                              <Edit />
                            </IconButton>
                            <IconButton onClick={() => handleDeletePaymentProvider(provider.id)} color="error">
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </ConfigGlassCard>

              {/* Payment Provider Dialog */}
              <Dialog open={!!editPaymentProvider} onClose={() => setEditPaymentProvider(null)}>
                <DialogTitle>{editPaymentProvider?.id ? 'Editar Proveedor' : 'Nuevo Proveedor'}</DialogTitle>
                <DialogContent>
                  <Box component="form" onSubmit={editPaymentProvider?.id ? handleUpdatePaymentProvider : handleCreatePaymentProvider} sx={{ mt: 2 }}>
                    <TextField
                      label="Nombre"
                      fullWidth
                      value={editPaymentProvider?.name || ''}
                      onChange={(e) => setEditPaymentProvider({ ...editPaymentProvider!, name: e.target.value })}
                      margin="normal"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editPaymentProvider?.active || false}
                          onChange={(e) => setEditPaymentProvider({ ...editPaymentProvider!, active: e.target.checked })}
                          color="primary"
                        />
                      }
                      label="Activo"
                      sx={{ mt: 2 }}
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      {editPaymentProvider?.id ? 'Actualizar' : 'Crear'}
                    </Button>
                  </Box>
                </DialogContent>
              </Dialog>
            </Box>
          )}

          {/* Configuraciones Tab */}
          {activeTab === 6 && (
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Button
                  variant="outlined"
                  onClick={toggleAllSettings}
                  startIcon={<ExpandMore />}
                  sx={{ borderRadius: '12px' }}
                >
                  {allSettingsExpanded ? 'Contraer Todo' : 'Expandir Todo'}
                </Button>
              </Box>

              {Object.entries(settingsByTag).map(([tag, settings]) => (
                <ConfigGlassCard key={tag} sx={{ mb: 2 }}>
                  <Accordion
                    sx={{ background: 'transparent', boxShadow: 'none' }}
                    expanded={expandedSettings[tag] || false}
                    onChange={() => setExpandedSettings(prev => ({ ...prev, [tag]: !prev[tag] }))}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32 }}>
                          <Settings sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="h6">{tag}</Typography>
                        <Chip label={`${settings.length} configs`} size="small" color="primary" variant="outlined" />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {settings.map((setting) => (
                          <Grid item xs={12} md={6} key={setting.key}>
                            <TextField
                              label={setting.key}
                              defaultValue={setting.value}
                              onBlur={(e) => handleSaveSetting(setting.key, e.target.value)}
                              fullWidth
                              variant="outlined"
                              size="small"
                              helperText={setting.description}
                              InputProps={{ sx: { borderRadius: '12px' } }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </ConfigGlassCard>
              ))}
            </Box>
          )}
        </motion.div>
      </Box>

      {/* Notificaciones */}
      <AnimatePresence>
        {error && (
          <Snackbar
            open
            autoHideDuration={3000}
            onClose={() => setError(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Alert
                severity="error"
                onClose={() => setError(null)}
                sx={{ boxShadow: theme.shadows[6], borderRadius: '12px' }}
              >
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
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Alert
                severity="success"
                onClose={() => setSuccess(null)}
                sx={{ boxShadow: theme.shadows[6], borderRadius: '12px' }}
              >
                {success}
              </Alert>
            </motion.div>
          </Snackbar>
        )}
      </AnimatePresence>
    </Box>
  );
}

// Función auxiliar para descripciones de características
const getFeatureDescription = (key: string) => {
  const descriptions: Record<string, string> = {
    enable_registration: 'Permite a nuevos usuarios registrarse en la plataforma. Si se desactiva, solo los administradores podrán crear cuentas.',
    enable_social_login: 'Permite el inicio de sesión con proveedores sociales como Google, Facebook, etc. Requiere configuración previa de las APIs.',
    disable_anonymous_users: 'Impide el acceso a usuarios no registrados. Todos los visitantes deberán iniciar sesión para usar la plataforma.',
    disable_credits: 'Deshabilita el sistema de créditos en la plataforma. Los usuarios no podrán comprar ni gastar créditos.',
    enable_payment_methods: 'Habilita diferentes métodos de pago como tarjetas, PayPal, etc. Requiere configuración previa de cada proveedor.',
    enable_points: 'Activa el sistema de puntos por actividades. Los usuarios ganarán puntos por completar acciones en la plataforma.',
    enable_badges: 'Permite la obtención de insignias al alcanzar ciertos logros. Configura los requisitos en la pestaña de Gamificación.',
    enable_coupons: 'Permite la creación y uso de cupones de descuento. Los usuarios podrán canjear cupones para obtener descuentos en compras.'
  };
  return descriptions[key] || 'Funcionalidad del sistema';
};

// Renderización de la tabla de orígenes
const renderOriginsTable = () => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Origen</TableCell>
          <TableCell>Acciones</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {(origins || []).map((origin) => (
          <TableRow key={origin}>
            <TableCell>{origin}</TableCell>
            <TableCell>
              {corsEnabled ? (
                <IconButton onClick={() => handleDeleteOrigin(origin)} color="error">
                  <Delete />
                </IconButton>
              ) : (
                <Typography color="textSecondary">Desactivado</Typography>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// Asegurar que las variables y funciones estén definidas
const corsEnabled = true; // Valor por defecto para evitar errores

const handleDeleteOrigin = (origin: string) => {
  console.error(`handleDeleteOrigin no implementado. Intentando eliminar: ${origin}`);
};

const origins: string[] = []; // Inicializar como un array vacío para evitar errores