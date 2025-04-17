// src/app/user/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableHead, TableRow, Link } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box, Grid, Card, CardContent, CardHeader, TextField, Button, Accordion, AccordionSummary, AccordionDetails, Typography, IconButton,
  Snackbar, Alert, MenuItem, Avatar, Chip, Divider, List, ListItem, ListItemAvatar, ListItemText, Badge, Paper, Tabs, Tab, useTheme, styled
} from "@mui/material";
import {
  AccountCircle, Lock, Payment, CreditCard, AddCircle, Delete, ExpandMore, Edit, History, AttachMoney, Security, Logout, Person,
  LocationOn, Language, Star, StarBorder,
  LocalActivity
} from "@mui/icons-material";
import { Integration } from "@/lib/types";

// Styled Components
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)`,
  color: 'white',
  borderRadius: '16px',
  boxShadow: theme.shadows[4]
}));

const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(248, 249, 250, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(222, 226, 230, 0.5)',
  borderRadius: '16px',
  boxShadow: theme.shadows[2]
}));

interface PaymentMethod {
  id: number;
  payment_type: string;
  details: string;
  is_default: boolean;
}

interface CreditTransaction {
  id: number;
  amount: number;
  transaction_type: string;
  payment_amount?: number;
  payment_method?: string;
  payment_status: string;
  timestamp: string;
}

interface PaymentProvider {
  id: number;
  name: string;
  active: boolean;
}

export default function UserDashboard() {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ email: "", username: "", ciudad: "", website: "" });
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [newMethod, setNewMethod] = useState({ payment_type: "", details: "", is_default: false });
  const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>([]);
  const [credits, setCredits] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [editMethod, setEditMethod] = useState<PaymentMethod | null>(null);
  const [deleteMethodId, setDeleteMethodId] = useState<number | null>(null);
  const { coupons, setCoupons } = useAuth();
  const [newIntegration, setNewIntegration] = useState({ name: "", webhook_url: "", event_type: "" });
  const [integrations, setIntegrations] = useState<Integration[]>([]);



  // Añadir este useEffect justo después de los useState existentes
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await fetchAPI<any[]>("/v1/coupons/"); // Ajusta el endpoint según tu API
        setCoupons(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar cupones");
      }
    };
    fetchCoupons();
  }, [setCoupons]);

  // Actualizar la función handleRedeem
  const handleRedeem = async (couponId: number) => {
    try {
      const { data } = await fetchAPI<any>(`/v1/coupons/redeem/${couponId}`, {
        method: "POST",
      });
      if (data) {
        setCoupons(coupons.map((c) => (c.id === couponId ? data : c)));
        const { data: info } = await fetchAPI<any>("/info");
        setCredits(info.credits);
        setSuccess("Cupón canjeado exitosamente");
      } else {
        setError("No se pudo canjear el cupón");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al canjear cupón");
    }
  };

  // Actualizar el contenido de la pestaña "Coupons" (tabValue === 2)


  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    setFormData({
      email: user.email || "",
      username: user.username || "",
      ciudad: user.ciudad || "",
      website: user.website || "",
    });

    const fetchData = async () => {
      try {
        const [transRes, methRes, providersRes, integrationsRes] = await Promise.all([
          fetchAPI<CreditTransaction[]>("/v1/payments/transactions"),
          fetchAPI<PaymentMethod[]>("/v1/payments/methods"),
          fetchAPI<PaymentProvider[]>("/v1/payment-providers"),
          fetchAPI<Integration[]>("/v1/integrations/"),
        ]);
        setTransactions(transRes.data || []);
        setMethods(methRes.data || []);
        setPaymentProviders(providersRes.data?.filter(p => p.active) || []);
        setIntegrations(integrationsRes.data || []);
        if (providersRes.data && providersRes.data.length > 0) {
          setNewMethod(prev => ({ ...prev, payment_type: providersRes.data.find(p => p.active)?.name || "" }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      }
    };
    fetchData();
  }, [user, router, credits]);

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

  const handleEditMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMethod) return;
    try {
      const { data } = await fetchAPI<PaymentMethod>(`/v1/payments/methods/${editMethod.id}`, {
        method: "PUT",
        data: editMethod,
      });
      setMethods(methods.map((m) => (m.id === data!.id ? data! : m)));
      setEditMethod(null);
      setSuccess("Método actualizado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar método");
    }
  };

  const handleDeleteMethod = async (id: number) => {
    try {
      await fetchAPI(`/v1/payments/methods/${id}`, { method: "DELETE" });
      setMethods(methods.filter((m) => m.id !== id));
      setDeleteMethodId(null);
      setSuccess("Método eliminado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar método");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setSuccess("Perfil actualizado");
      setEditMode(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar perfil");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await fetchAPI<{ message: string }>("/v1/auth/me/password", {
        method: "PUT",
        data: { current_password: currentPassword, new_password: newPassword },
      });
      setSuccess(data?.message || "Contraseña actualizada");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar contraseña");
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await fetchAPI<CreditTransaction>("/v1/payments/purchase", {
        method: "POST",
        data: { credits: parseInt(credits), payment_amount: parseFloat(paymentAmount), payment_method: "stripe" },
      });
      setTransactions([data!, ...transactions]);
      setCredits("");
      setPaymentAmount("");
      setSuccess("Créditos comprados");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al comprar créditos");
    }
  };

  const handleAddMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await fetchAPI<PaymentMethod>("/v1/payments/methods", {
        method: "POST",
        data: newMethod,
      });
      setMethods([...methods, data!]);
      setNewMethod({ payment_type: paymentProviders[0]?.name || "", details: "", is_default: false });
      setSuccess("Método añadido");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al añadir método");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await fetchAPI(`/v1/payments/methods/${id}/default`, { method: "PUT" });
      setMethods(methods.map((m) => ({ ...m, is_default: m.id === id })));
      setSuccess("Método predeterminado actualizado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al establecer predeterminado");
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("¿Estás seguro de eliminar tu cuenta? Esta acción es irreversible.")) {
      try {
        await fetchAPI("/v1/users/me", { method: "DELETE" });
        await logout();
        router.push("/user/auth/#login");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al eliminar cuenta");
      }
    }
  };

  if (!user) return (
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
        <Typography variant="h6" color="textSecondary">Cargando tu perfil...</Typography>
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
              Hola, {user.username}!
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Bienvenido a tu panel de control
            </Typography>
          </motion.div>

          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <IconButton onClick={() => setEditMode(true)} size="small" sx={{ bgcolor: 'primary.main', color: 'white' }}>
                <Edit fontSize="small" />
              </IconButton>
            }
          >
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: theme.palette.primary.main,
                fontSize: '2rem',
                boxShadow: theme.shadows[6]
              }}
            >
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
        </Box>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Credits Card */}
            <Grid item xs={12} md={4}>
              <GradientCard>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>
                        Tus Créditos
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                        {user.credits ?? 0}
                      </Typography>
                    </Box>
                    <AttachMoney sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </GradientCard>
            </Grid>

            {/* Transactions Card */}
            <Grid item xs={12} md={4}>
              <GradientCard sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>
                        Transacciones
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                        {transactions.length}
                      </Typography>
                    </Box>
                    <History sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </GradientCard>
            </Grid>

            {/* Payment Methods Card */}
            <Grid item xs={12} md={4}>
              <GradientCard sx={{ background: 'linear-gradient(135deg, #a6c1ee 0%, #fbc2eb 100%)' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>
                        Métodos de Pago
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                        {methods.length}
                      </Typography>
                    </Box>
                    <Payment sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Box>
                </CardContent>
              </GradientCard>
            </Grid>
          </Grid>
        </motion.div>

        {/* Tabs Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Paper sx={{ mb: 3, borderRadius: '12px', overflow: 'hidden' }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Perfil" icon={<Person />} iconPosition="start" />
              <Tab label="Seguridad" icon={<Security />} iconPosition="start" />
              <Tab label="Cupones" icon={<LocalActivity />} iconPosition="start" />
              <Tab label="Transacciones" icon={<History />} iconPosition="start" />
              <Tab label="Métodos de Pago" icon={<Payment />} iconPosition="start" />
              <Tab label="Comprar Créditos" icon={<CreditCard />} iconPosition="start" />
              <Tab label="Integraciones" icon={<Link />} iconPosition="start" />
            </Tabs>
          </Paper>
        </motion.div>

        {/* Tab Content */}
        <Box sx={{ mb: 4 }}>
          {/* Profile Tab */}
          {tabValue === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <GlassCard>
                    <CardHeader
                      title="Información Personal"
                      avatar={<AccountCircle color="primary" />}
                      action={
                        <IconButton onClick={() => setEditMode(!editMode)}>
                          <Edit color="primary" />
                        </IconButton>
                      }
                    />
                    <CardContent>
                      <AnimatePresence mode="wait">
                        {editMode ? (
                          <Box
                            component={motion.form}
                            key="edit"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleUpdate}
                            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                          >
                            <TextField
                              label="Email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              fullWidth
                              variant="outlined"
                              size="small"
                            />
                            <TextField
                              label="Username"
                              type="text"
                              value={formData.username}
                              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                              fullWidth
                              variant="outlined"
                              size="small"
                            />
                            <TextField
                              label="Ciudad"
                              type="text"
                              value={formData.ciudad}
                              onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                              fullWidth
                              variant="outlined"
                              size="small"
                              InputProps={{
                                startAdornment: <LocationOn color="action" sx={{ mr: 1 }} />
                              }}
                            />
                            <TextField
                              label="Website"
                              type="text"
                              value={formData.website}
                              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                              fullWidth
                              variant="outlined"
                              size="small"
                              InputProps={{
                                startAdornment: <Language color="action" sx={{ mr: 1 }} />
                              }}
                            />
                            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                              <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                sx={{ flex: 1 }}
                              >
                                Guardar Cambios
                              </Button>
                              <Button
                                onClick={() => setEditMode(false)}
                                variant="outlined"
                                sx={{ flex: 1 }}
                              >
                                Cancelar
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Box
                            component={motion.div}
                            key="view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <List>
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                                    <Person />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary="Username"
                                  secondary={user.username || "No especificado"}
                                  secondaryTypographyProps={{ color: "textPrimary" }}
                                />
                              </ListItem>
                              <Divider variant="inset" component="li" />
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: theme.palette.info.light }}>
                                    <AccountCircle />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary="Email"
                                  secondary={user.email || "No especificado"}
                                  secondaryTypographyProps={{ color: "textPrimary" }}
                                />
                              </ListItem>
                              <Divider variant="inset" component="li" />
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: theme.palette.success.light }}>
                                    <LocationOn />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary="Ciudad"
                                  secondary={user.ciudad || "No especificado"}
                                  secondaryTypographyProps={{ color: "textPrimary" }}
                                />
                              </ListItem>
                              <Divider variant="inset" component="li" />
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar sx={{ bgcolor: theme.palette.warning.light }}>
                                    <Language />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary="Website"
                                  secondary={user.website || "No especificado"}
                                  secondaryTypographyProps={{ color: "textPrimary" }}
                                />
                              </ListItem>
                            </List>
                          </Box>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </GlassCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <GlassCard>
                    <CardHeader
                      title="Actividad Reciente"
                      avatar={<History color="primary" />}
                    />
                    <CardContent>
                      {transactions.slice(0, 3).length > 0 ? (
                        <List>
                          {transactions.slice(0, 3).map((t) => (
                            <motion.div
                              key={t.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ListItem>
                                <ListItemAvatar>
                                  <Avatar sx={{
                                    bgcolor: t.amount > 0 ? theme.palette.success.light : theme.palette.error.light
                                  }}>
                                    {t.amount > 0 ? "+" : "-"}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={`${t.transaction_type}`}
                                  secondary={`${new Date(t.timestamp).toLocaleString()} • ${t.payment_status}`}
                                />
                                <Typography variant="body2" color={t.amount > 0 ? "success.main" : "error.main"}>
                                  {t.amount > 0 ? "+" : ""}{t.amount} créditos
                                </Typography>
                              </ListItem>
                              <Divider variant="inset" component="li" />
                            </motion.div>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                          No hay actividad reciente
                        </Typography>
                      )}
                      <Button
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => setTabValue(2)}
                      >
                        Ver todas las transacciones
                      </Button>
                    </CardContent>
                  </GlassCard>
                </Grid>
              </Grid>

              {/* Danger Zone moved to Profile Tab */}
              <GlassCard sx={{ mt: 3 }}>
                <CardHeader
                  title="Zona Peligrosa"
                  avatar={<Security color="error" />}
                />
                <CardContent>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Estas acciones son irreversibles. Por favor, procede con precaución.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      onClick={logout}
                      variant="outlined"
                      color="secondary"
                      startIcon={<Logout />}
                      sx={{ flex: 1 }}
                    >
                      Cerrar Sesión
                    </Button>
                    <Button
                      onClick={handleDeleteAccount}
                      variant="contained"
                      color="error"
                      startIcon={<Delete />}
                      sx={{ flex: 1 }}
                    >
                      Eliminar Cuenta
                    </Button>
                  </Box>
                </CardContent>
              </GlassCard>
            </motion.div>
          )}

          {/* Security Tab */}
          {tabValue === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <GlassCard>
                    <CardHeader
                      title="Cambiar Contraseña"
                      avatar={<Lock color="primary" />}
                    />
                    <CardContent>
                      <Box
                        component="form"
                        onSubmit={handleChangePassword}
                        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                      >
                        <TextField
                          label="Contraseña Actual"
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          fullWidth
                          required
                          variant="outlined"
                          size="small"
                          InputProps={{
                            startAdornment: <Lock color="action" sx={{ mr: 1 }} />
                          }}
                        />
                        <TextField
                          label="Nueva Contraseña"
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          fullWidth
                          required
                          variant="outlined"
                          size="small"
                          InputProps={{
                            startAdornment: <Security color="action" sx={{ mr: 1 }} />
                          }}
                        />
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          sx={{ mt: 1 }}
                        >
                          Actualizar Contraseña
                        </Button>
                      </Box>
                    </CardContent>
                  </GlassCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <GlassCard>
                    <CardHeader
                      title="Métodos de Pago"
                      subheader={`${methods.length} configurados`}
                      avatar={<Payment color="primary" />}
                    />
                    <CardContent>
                      {methods.length > 0 ? (
                        <List>
                          {methods.slice(0, 2).map((m) => (
                            <ListItem key={m.id}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: m.is_default ? theme.palette.success.light : theme.palette.grey[300] }}>
                                  {m.is_default ? <Star /> : <StarBorder />}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={m.payment_type}
                                secondary={m.details}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 2 }}>
                          No hay métodos de pago configurados
                        </Typography>
                      )}
                      <Button
                        fullWidth
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => setTabValue(3)}
                      >
                        {methods.length > 0 ? 'Gestionar métodos' : 'Añadir método'}
                      </Button>
                    </CardContent>
                  </GlassCard>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {/* Coupons Tab */}
          {tabValue === 2 && (

            <Box>
              <Typography variant="h6">Mis Cupones</Typography>
              {(!coupons || coupons.length === 0) ? (
                <Typography>No tienes cupones</Typography>
              ) : (
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
                            color={coupon.status === "active" ? "success" : "error"}
                          />
                        </TableCell>
                        <TableCell>
                          {coupon.status === "active" && (
                            <Button
                              variant="contained"
                              onClick={() => handleRedeem(coupon.id)}
                            >
                              Canjear
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Box>
          )
          }



          {/* Transactions Tab */}
          {tabValue === 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <GlassCard>
                <CardHeader
                  title="Historial de Transacciones"
                  avatar={<History color="primary" />}
                  action={
                    <Chip
                      label={`${transactions.length} transacciones`}
                      color="primary"
                      variant="outlined"
                    />
                  }
                />
                <CardContent>
                  {transactions.length === 0 ? (
                    <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                      No hay transacciones registradas
                    </Typography>
                  ) : (
                    <List sx={{ maxHeight: '500px', overflow: 'auto' }}>
                      {transactions.map((t, index) => (
                        <motion.div
                          key={t.id || index} // Usar `index` como respaldo si `t.id` no está definido
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{
                                bgcolor: t.amount > 0 ? theme.palette.success.light : theme.palette.error.light
                              }}>
                                {t.amount > 0 ? "+" : "-"}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={t.transaction_type || "N/A"}
                              secondary={`${t.timestamp ? new Date(t.timestamp).toLocaleString() : "N/A"} • ${t.payment_status || "N/A"}`}
                            />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </motion.div>
                      ))}
                    </List>
                  )}
                </CardContent>
              </GlassCard>
            </motion.div>
          )}

          {/* Payment Methods Tab */}
          {tabValue === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <GlassCard>
                <CardHeader
                  title="Métodos de Pago"
                  avatar={<Payment color="primary" />}
                  subheader="Gestiona tus métodos de pago asociados"
                />
                <CardContent>
                  {methods.length > 0 && (
                    <List sx={{ mb: 3 }}>
                      {methods.map((m) => (
                        <Paper key={m.id} elevation={2} sx={{ mb: 2, borderRadius: "8px", overflow: "hidden" }}>
                          <ListItem>
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: m.is_default ? theme.palette.success.main : theme.palette.grey[300] }}>
                                {m.is_default ? <Star /> : <CreditCard />}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                  <Typography sx={{ mr: 1 }}>{m.payment_type}</Typography>
                                  {m.is_default && (
                                    <Chip label="Predeterminado" size="small" color="success" variant="outlined" />
                                  )}
                                </Box>
                              }
                              secondary={m.details}
                            />
                            <Box sx={{ display: "flex", gap: 1 }}>
                              <IconButton onClick={() => setEditMethod(m)} color="primary">
                                <Edit />
                              </IconButton>
                              <IconButton onClick={() => setDeleteMethodId(m.id)} color="error">
                                <Delete />
                              </IconButton>
                              {!m.is_default && (
                                <Button
                                  onClick={() => handleSetDefault(m.id)}
                                  variant="outlined"
                                  size="small"
                                >
                                  Hacer Predeterminado
                                </Button>
                              )}
                            </Box>
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  )}

                  {/* Formulario para añadir método */}
                  <Accordion
                    sx={{
                      background: "rgba(255, 255, 255, 0.05)",
                      boxShadow: "none",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Typography>Añadir nuevo método de pago</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box component="form" onSubmit={handleAddMethod} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                          label="Tipo"
                          select
                          value={newMethod.payment_type}
                          onChange={(e) => setNewMethod({ ...newMethod, payment_type: e.target.value })}
                          fullWidth
                          variant="outlined"
                          size="small"
                        >
                          {paymentProviders.map((provider) => (
                            <MenuItem key={provider.id} value={provider.name}>
                              {provider.name}
                            </MenuItem>
                          ))}
                        </TextField>
                        <TextField
                          label="Detalles"
                          value={newMethod.details}
                          onChange={(e) => setNewMethod({ ...newMethod, details: e.target.value })}
                          fullWidth
                          required
                          variant="outlined"
                          size="small"
                          multiline
                          rows={3}
                        />
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          startIcon={<AddCircle />}
                          sx={{ mt: 1 }}
                        >
                          Añadir Método
                        </Button>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </GlassCard>

              {/* Diálogo para editar método */}
              <Dialog open={!!editMethod} onClose={() => setEditMethod(null)}>
                <DialogTitle>Editar Método de Pago</DialogTitle>
                <DialogContent>
                  <Box
                    component="form"
                    onSubmit={handleEditMethod}
                    sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
                  >
                    <TextField
                      label="Tipo"
                      select
                      value={editMethod?.payment_type || ""}
                      onChange={(e) => setEditMethod({ ...editMethod!, payment_type: e.target.value })}
                      fullWidth
                      variant="outlined"
                      size="small"
                    >
                      {paymentProviders.map((provider) => (
                        <MenuItem key={provider.id} value={provider.name}>
                          {provider.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Detalles"
                      value={editMethod?.details || ""}
                      onChange={(e) => setEditMethod({ ...editMethod!, details: e.target.value })}
                      fullWidth
                      required
                      variant="outlined"
                      size="small"
                      multiline
                      rows={3}
                    />
                    <DialogActions>
                      <Button onClick={() => setEditMethod(null)} variant="outlined">
                        Cancelar
                      </Button>
                      <Button type="submit" variant="contained" color="primary">
                        Guardar
                      </Button>
                    </DialogActions>
                  </Box>
                </DialogContent>
              </Dialog>

              {/* Diálogo para confirmar eliminación */}
              <Dialog open={!!deleteMethodId} onClose={() => setDeleteMethodId(null)}>
                <DialogTitle>¿Eliminar Método de Pago?</DialogTitle>
                <DialogContent>
                  <Typography>Esta acción es irreversible. ¿Estás seguro de eliminar este método?</Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setDeleteMethodId(null)} variant="outlined">
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleDeleteMethod(deleteMethodId!)}
                    variant="contained"
                    color="error"
                  >
                    Eliminar
                  </Button>
                </DialogActions>
              </Dialog>
            </motion.div>
          )}

          {/* Buy Credits Tab */}
          {tabValue === 5 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <GlassCard>
                    <CardHeader title="Comprar Créditos" avatar={<AttachMoney color="primary" />} subheader="Recarga tu saldo de créditos" />
                    <CardContent>
                      <Box component="form" onSubmit={handlePurchase} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <TextField
                          label="Cantidad de Créditos"
                          type="number"
                          value={credits}
                          onChange={(e) => setCredits(e.target.value)}
                          fullWidth
                          required
                          variant="outlined"
                          size="small"
                          InputProps={{ startAdornment: <AttachMoney color="action" sx={{ mr: 1 }} /> }}
                        />
                        <TextField
                          label="Monto a Pagar (USD)"
                          type="number"
                          inputProps={{ step: "0.01" }}
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          fullWidth
                          required
                          variant="outlined"
                          size="small"
                          InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>$</Typography> }}
                        />
                        <TextField
                          label="Método de Pago"
                          select
                          value={methods.find((m) => m.is_default)?.id || methods[0]?.id || ""}
                          onChange={(e) => {
                            const selectedMethod = methods.find((m) => m.id === parseInt(e.target.value));
                            if (selectedMethod) {
                              handleSetDefault(selectedMethod.id);
                            }
                          }}
                          fullWidth
                          variant="outlined"
                          size="small"
                          disabled={methods.length === 0}
                          helperText={methods.length === 0 ? "No hay métodos de pago disponibles" : "Selecciona un método de pago"}
                        >
                          {methods.map((method) => (
                            <MenuItem key={method.id} value={method.id}>
                              {method.payment_type} - {method.details} {method.is_default ? "(Predeterminado)" : ""}
                            </MenuItem>
                          ))}
                        </TextField>
                        <Button type="submit" variant="contained" color="primary" size="large" sx={{ mt: 2 }} disabled={methods.length === 0}>
                          Comprar Créditos
                        </Button>
                      </Box>
                    </CardContent>
                  </GlassCard>
                </Grid>

                <Grid item xs={12} md={6}>
                  <GlassCard>
                    <CardHeader title="Tarifas y Beneficios" avatar={<CreditCard color="primary" />} />
                    <CardContent>
                      <List>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: theme.palette.success.light }}>
                              <Star />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary="1 crédito = $1 USD" secondary="Tasa de cambio fija" />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: theme.palette.info.light }}>
                              <Payment />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary="Múltiples métodos de pago" secondary="Tarjetas, PayPal y más" />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: theme.palette.warning.light }}>
                              <Security />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText primary="Transacciones seguras" secondary="Encriptación SSL" />
                        </ListItem>
                      </List>
                    </CardContent>
                  </GlassCard>
                </Grid>
              </Grid>
            </motion.div>
          )}

          {tabValue === 6 && (
            <Box>
              <Box component="form" onSubmit={handleAddIntegration} sx={{ mb: 2 }}>
                <TextField label="Nombre" value={newIntegration.name} onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })} />
                <TextField label="Webhook URL" value={newIntegration.webhook_url} onChange={(e) => setNewIntegration({ ...newIntegration, webhook_url: e.target.value })} />
                <TextField label="Tipo de Evento" value={newIntegration.event_type} onChange={(e) => setNewIntegration({ ...newIntegration, event_type: e.target.value })} />
                <Button type="submit" variant="contained">Añadir</Button>
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
                      <TableCell>{integration.active ? "Activo (Admin)" : "Pendiente"}</TableCell>
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
        </Box>
      </Box>

      {/* Notifications */}
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
    </Box >
  );
}