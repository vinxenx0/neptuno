// frontend/src/app/%28users%29/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
} from "@mui/material";
import { Menu as MenuIcon } from "@mui/icons-material";
import Sidebar from "@/components/admin/Sidebar";
import HomeSection from "@/components/admin/HomeSection";
import FeaturesSection from "@/components/admin/FeaturesSection";
import OriginsSection from "@/components/admin/OriginsSection";
import IntegrationsSection from "@/components/admin/IntegrationsSection";
import GamificationSection from "@/components/admin/GamificationSection";
import CouponsSection from "@/components/admin/CouponsSection";
import PaymentsSection from "@/components/admin/PaymentsSection";
import SettingsSection from "@/components/admin/SettingsSection";
import MarketplaceSection from "@/components/admin/MarketplaceSection";
import RevenuesSection from "@/components/admin/RevenuesSection";
import LogsSection from "@/components/admin/LogsSection";
import UsersSection from "@/components/admin/UsersSection";
import PrivacySection from "@/components/admin/PrivacySection";
import PlaceholderSection from "@/components/admin/PlaceholderSection";
import {
  Home,
  AttachMoney,
  Description,
  People,
  Security,
  EmojiEvents,
  LocalActivity,
  Store,
  Payment,
  Event,
  Badge as BadgeIcon,
  BarChart,
  Add,
  List,
  Category,
  Inventory,
  ShoppingCart,
  CreditCard,
  Receipt,
} from "@mui/icons-material";
import {
  SiteSetting,
  Integration,
  EventType,
  Badge,
  PaymentProvider,
  Coupon,
  CouponType,
} from "@/lib/types";

interface AllowedOrigin {
  id: number;
  origin: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("Inicio");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Estados para las secciones existentes
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
    enable_marketplace: true,
  });
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>([]);
  const [editEventType, setEditEventType] = useState<EventType | null>(null);
  const [editBadge, setEditBadge] = useState<Badge | null>(null);
  const [editPaymentProvider, setEditPaymentProvider] = useState<PaymentProvider | null>(null);
  const [expandedSettings, setExpandedSettings] = useState<Record<string, boolean>>({});
  const [allSettingsExpanded, setAllSettingsExpanded] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [couponTypes, setCouponTypes] = useState<CouponType[]>([]);
  const [editCouponType, setEditCouponType] = useState<CouponType | null>(null);
  const [corsEnabled, setCorsEnabled] = useState<boolean | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  const drawerWidth = 240;

  // Validación de origins como array
  useEffect(() => {
    if (!Array.isArray(origins)) {
      setOrigins([]);
    }
  }, [origins]);

  // Fetch inicial de datos
  useEffect(() => {
    if (!user || user.rol !== "admin") {
      router.push("/auth/login");
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
        setExpandedSettings(Object.keys(grouped || {}).reduce((acc, tag) => ({ ...acc, [tag]: false }), {}));

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
          fetchAPI("/v1/settings/enable_marketplace"),
        ]);
        setFeatures({
          enable_registration: featuresRes[0]?.data === "true",
          enable_social_login: featuresRes[1]?.data === "true",
          disable_anonymous_users: featuresRes[2]?.data === "true",
          disable_credits: featuresRes[3]?.data === "true",
          enable_payment_methods: featuresRes[4]?.data === "true",
          enable_points: featuresRes[5]?.data === "true",
          enable_badges: featuresRes[6]?.data === "true",
          enable_coupons: featuresRes[7]?.data === "true",
          enable_marketplace: featuresRes[8]?.data === "true",
        });

        const { data: corsEnabledData } = await fetchAPI("/v1/settings/cors_enabled");
        setCorsEnabled(corsEnabledData === "true");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, router]);

  // Funciones de manejo de eventos
  const handleToggleCors = async () => {
    try {
      const { data } = await fetchAPI<{ key: string; value: boolean }>("/v1/settings/admin/config", {
        method: "POST",
        data: { key: "allowed_origins", value: !corsEnabled },
      });
      setCorsEnabled(data!.value);
      setSuccess(`CORS ${data!.value ? "activado" : "desactivado"}`);
      setTimeout(() => setSuccess(null), 3000);
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
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar configuración");
    }
  };

  const handleAddOrigin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI("/v1/settings/allowed-origins", { method: "POST", data: { origin: newOrigin } });
      setNewOrigin("");
      setSuccess("Origen añadido con éxito");
      const { data } = await fetchAPI<AllowedOrigin[]>("/v1/origins");
      setOrigins(data?.map((o) => o.origin) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al añadir origen");
    }
  };

  const handleDeleteOrigin = async (origin: string) => {
    try {
      await fetchAPI(`/v1/settings/allowed-origins/${encodeURIComponent(origin)}`, { method: "DELETE" });
      setSuccess("Origen eliminado con éxito");
      const { data } = await fetchAPI<AllowedOrigin[]>("/v1/origins");
      setOrigins(data?.map((o) => o.origin) || []);
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
      const { data } = await fetchAPI<{ id: number; active: boolean }>(`/v1/integrations/${id}/toggle`, { method: "PUT" });
      setIntegrations((prev) => prev.map((i) => (i.id === id ? { ...i, active: data!.active } : i)));
      setSuccess(`Integración ${data!.active ? "activada" : "desactivada"}`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar integración");
    }
  };

  const handleDeleteIntegration = async (id: number) => {
    try {
      await fetchAPI(`/v1/integrations/${id}`, { method: "DELETE" });
      setIntegrations(integrations.filter((i) => i.id !== id));
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
      const provider = paymentProviders.find((p) => p.id === id);
      if (!provider) throw new Error("Proveedor no encontrado");
      const updatedProvider = { ...provider, active: !active };
      const { data } = await fetchAPI<PaymentProvider>(`/v1/payment-providers/${id}`, { method: "PUT", data: updatedProvider });
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
      const { data } = await fetchAPI<PaymentProvider>(`/v1/payment-providers/${editPaymentProvider.id}`, { method: "PUT", data: editPaymentProvider });
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

  const handleSubmitCouponType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCouponType) return;
    try {
      if (editCouponType.id) {
        const { data } = await fetchAPI<CouponType>(`/v1/coupons/types/${editCouponType.id}`, { method: "PUT", data: editCouponType });
        setCouponTypes(couponTypes.map((ct) => (ct.id === data!.id ? data! : ct)));
      } else {
        const { data } = await fetchAPI<CouponType>("/v1/coupons/types", { method: "POST", data: editCouponType });
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

  // Definición del sidebar con nuevas secciones y subopciones
  const sidebarItems = [
    { name: "Inicio", icon: <Home /> },
    { name: "Revenues", icon: <AttachMoney /> },
    { name: "Logs", icon: <Description /> },
    { name: "Usuarios", icon: <People /> },
    { name: "Privacidad", icon: <Security /> },
    {
      name: "Gamificación",
      icon: <EmojiEvents />,
      suboptions: [
        { name: "Tipos de Evento", icon: <Event /> },
        { name: "Insignias", icon: <BadgeIcon /> },
        { name: "Estadisticas", icon: <BarChart /> },
      ],
    },
    {
      name: "Cupones",
      icon: <LocalActivity />,
      suboptions: [
        { name: "Nuevos cupones", icon: <Add /> },
        { name: "Listado", icon: <List /> },
      ],
    },
    {
      name: "Marketplace",
      icon: <Store />,
      suboptions: [
        { name: "Categorias", icon: <Category /> },
        { name: "Productos", icon: <Inventory /> },
        { name: "Pedidos", icon: <ShoppingCart /> },
      ],
    },
    {
      name: "Pagos",
      icon: <Payment />,
      suboptions: [
        { name: "Medios de pago", icon: <CreditCard /> },
        { name: "Transacciones", icon: <Receipt /> },
        { name: "Registros", icon: <Description /> },
      ],
    },
  ];

  // Renderizado de secciones
  const renderSection = () => {
    switch (selectedSection) {
      case "Inicio":
        return (
          <HomeSection
            settingsCount={Object.values(settingsByTag).flat().length}
            originsCount={origins.length}
            integrationsCount={integrations.length}
            eventTypesCount={eventTypes.length}
            paymentProvidersCount={paymentProviders.length}
          />
        );
      case "Funcionalidades":
        return <FeaturesSection features={features} onToggle={handleToggleFeature} />;
      case "Orígenes":
        return (
          <OriginsSection
            corsEnabled={corsEnabled}
            origins={origins}
            newOrigin={newOrigin}
            setNewOrigin={setNewOrigin}
            onToggleCors={handleToggleCors}
            onAddOrigin={handleAddOrigin}
            onDeleteOrigin={handleDeleteOrigin}
          />
        );
      case "Integraciones":
        return (
          <IntegrationsSection
            integrations={integrations}
            newIntegration={newIntegration}
            setNewIntegration={setNewIntegration}
            selectedUserId={selectedUserId}
            setSelectedUserId={setSelectedUserId}
            onAdd={handleAddIntegration}
            onToggle={handleToggleIntegration}
            onDelete={handleDeleteIntegration}
          />
        );
      case "Gamificación":
        return (
          <GamificationSection
            eventTypes={eventTypes}
            badges={badges}
            editEventType={editEventType}
            setEditEventType={setEditEventType}
            editBadge={editBadge}
            setEditBadge={setEditBadge}
            onCreateEventType={handleCreateEventType}
            onUpdateEventType={handleUpdateEventType}
            onDeleteEventType={handleDeleteEventType}
            onCreateBadge={handleCreateBadge}
            onUpdateBadge={handleUpdateBadge}
            onDeleteBadge={handleDeleteBadge}
          />
        );
      case "Cupones":
        return (
          <CouponsSection
            couponTypes={couponTypes}
            coupons={coupons}
            editCouponType={editCouponType}
            setEditCouponType={setEditCouponType}
            onSubmitCouponType={handleSubmitCouponType}
            onDeleteCoupon={handleDeleteCoupon}
          />
        );
      case "Pagos":
        return (
          <PaymentsSection
            paymentProviders={paymentProviders}
            editPaymentProvider={editPaymentProvider}
            setEditPaymentProvider={setEditPaymentProvider}
            onToggle={handleTogglePaymentProvider}
            onCreate={handleCreatePaymentProvider}
            onUpdate={handleUpdatePaymentProvider}
            onDelete={handleDeletePaymentProvider}
          />
        );
      case "Configuraciones":
        return (
          <SettingsSection
            settingsByTag={settingsByTag}
            expandedSettings={expandedSettings}
            setExpandedSettings={setExpandedSettings}
            allSettingsExpanded={allSettingsExpanded}
            setAllSettingsExpanded={setAllSettingsExpanded}
            onSave={handleSaveSetting}
          />
        );
      case "Marketplace":
        return <MarketplaceSection />;
      case "Revenues":
        return <RevenuesSection />;
      case "Logs":
        return <LogsSection />;
      case "Usuarios":
        return <UsersSection />;
      case "Privacidad":
        return <PrivacySection />;
      case "Gamificación - Tipos de Evento":
        return <PlaceholderSection title="Tipos de Evento" />;
      case "Gamificación - Insignias":
        return <PlaceholderSection title="Insignias" />;
      case "Gamificación - Estadisticas":
        return <PlaceholderSection title="Estadisticas" />;
      case "Cupones - Nuevos cupones":
        return <PlaceholderSection title="Nuevos cupones" />;
      case "Cupones - Listado":
        return <PlaceholderSection title="Listado de Cupones" />;
      case "Marketplace - Categorias":
        return <PlaceholderSection title="Categorias" />;
      case "Marketplace - Productos":
        return <PlaceholderSection title="Productos" />;
      case "Marketplace - Pedidos":
        return <PlaceholderSection title="Pedidos" />;
      case "Pagos - Medios de pago":
        return <PlaceholderSection title="Medios de pago" />;
      case "Pagos - Transacciones":
        return <PlaceholderSection title="Transacciones" />;
      case "Pagos - Registros":
        return <PlaceholderSection title="Registros" />;
      default:
        return <Typography>Sección no encontrada</Typography>;
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Typography variant="h6" color="textSecondary">Cargando panel de administración...</Typography>
      </Box>
    );
  }

  if (!user || user.rol !== "admin") {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h6" color="error">No autorizado</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: theme.zIndex.drawer + 1, display: { md: "none" } }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">Panel de Administración</Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" } }}
      >
        <Toolbar />
        <Sidebar items={sidebarItems} onSelect={setSelectedSection} selectedSection={selectedSection} />
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: { xs: 8, md: 0 }, maxWidth: "1400px", mx: "auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderSection()}
        </motion.div>
      </Box>

      <AnimatePresence>
        {error && (
          <Snackbar
            open
            autoHideDuration={3000}
            onClose={() => setError(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Snackbar>
        )}
        {success && (
          <Snackbar
            open
            autoHideDuration={3000}
            onClose={() => setSuccess(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert severity="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          </Snackbar>
        )}
      </AnimatePresence>
    </Box>
  );
}