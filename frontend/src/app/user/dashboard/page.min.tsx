// src/app/user/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableHead, TableRow, Link, MenuItem } from "@mui/material";
import { Box, Grid, Typography, TextField, Button, IconButton, Tabs, Tab, Chip } from "@mui/material";
import {
  AccountCircle, Lock, Payment, CreditCard, AddCircle, Delete, Edit, History, AttachMoney, Security, Logout, Person, LocationOn, Language, LocalActivity
} from "@mui/icons-material";
import MinimalCard from "@/components/ui/MinimalCard";
import MinimalForm from "@/components/ui/MinimalForm";
import MinimalList from "@/components/ui/MinimalList";
import Notification from "@/components/ui/Notification";
import { Integration } from "@/lib/types";

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
  const { user, logout, updateProfile, coupons, setCoupons } = useAuth();
  const router = useRouter();
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
  const [newIntegration, setNewIntegration] = useState({ name: "", webhook_url: "", event_type: "" });
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data } = await fetchAPI<any[]>("/v1/coupons/me");
        setCoupons(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar cupones");
      }
    };
    fetchCoupons();
  }, [setCoupons]);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear integración");
    }
  };

  const handleDeleteIntegration = async (id: number) => {
    try {
      await fetchAPI(`/v1/integrations/${id}`, { method: "DELETE" });
      setIntegrations(integrations.filter((i) => i.id !== id));
      setSuccess("Integración eliminada");
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al añadir método");
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await fetchAPI(`/v1/payments/methods/${id}/default`, { method: "PUT" });
      setMethods(methods.map((m) => ({ ...m, is_default: m.id === id })));
      setSuccess("Método predeterminado actualizado");
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

  const handleRedeem = async (couponId: number) => {
    try {
      const { data } = await fetchAPI<any>(`/v1/coupons/redeem/${couponId}`, { method: "POST" });
      if (data) {
        setCoupons(coupons.map((c) => (c.id === couponId ? data : c)));
        const { data: info } = await fetchAPI<any>("/info");
        setSuccess("Cupón canjeado exitosamente");
      } else {
        setError("No se pudo canjear el cupón");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al canjear cupón");
    }
  };

  if (!user) return <Typography>Cargando...</Typography>;

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Hola, {user.username}!
        </Typography>
        <IconButton onClick={() => setEditMode(true)}><Edit /></IconButton>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <MinimalCard title="Créditos" value={user.credits ?? 0} icon={<AttachMoney />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MinimalCard title="Transacciones" value={transactions.length} icon={<History />} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <MinimalCard title="Métodos de Pago" value={methods.length} icon={<Payment />} />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3, bgcolor: "white", borderRadius: 2 }}>
        <Tab label="Perfil" icon={<Person />} iconPosition="start" />
        <Tab label="Seguridad" icon={<Security />} iconPosition="start" />
        <Tab label="Cupones" icon={<LocalActivity />} iconPosition="start" />
        <Tab label="Transacciones" icon={<History />} iconPosition="start" />
        <Tab label="Métodos de Pago" icon={<Payment />} iconPosition="start" />
        <Tab label="Comprar Créditos" icon={<CreditCard />} iconPosition="start" />
        <Tab label="Integraciones" icon={<Link />} iconPosition="start" />
      </Tabs>

      {/* Tab Content */}
      {tabValue === 0 && (
        <Box>
          {editMode ? (
            <MinimalForm onSubmit={handleUpdate}>
              <TextField label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <TextField label="Username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
              <TextField label="Ciudad" value={formData.ciudad} onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })} />
              <TextField label="Website" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
            </MinimalForm>
          ) : (
            <MinimalList items={[
              { primary: "Username", secondary: user.username || "No especificado" },
              { primary: "Email", secondary: user.email || "No especificado" },
              { primary: "Ciudad", secondary: user.ciudad || "No especificado" },
              { primary: "Website", secondary: user.website || "No especificado" },
            ]} />
          )}
          <Box sx={{ mt: 3 }}>
            <Button onClick={logout} variant="outlined" color="secondary" startIcon={<Logout />}>Cerrar Sesión</Button>
            <Button onClick={handleDeleteAccount} variant="contained" color="error" startIcon={<Delete />} sx={{ ml: 2 }}>Eliminar Cuenta</Button>
          </Box>
        </Box>
      )}

      {tabValue === 1 && (
        <MinimalForm onSubmit={handleChangePassword}>
          <TextField label="Contraseña Actual" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <TextField label="Nueva Contraseña" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </MinimalForm>
      )}

      {tabValue === 2 && (
        <Table sx={{ bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
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
                <TableCell><Chip label={coupon.status} color={coupon.status === "active" ? "success" : "error"} /></TableCell>
                <TableCell>
                  {coupon.status === "active" && <Button onClick={() => handleRedeem(coupon.id)}>Canjear</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {tabValue === 3 && (
        <MinimalList items={transactions.map(t => ({
          primary: t.transaction_type,
          secondary: `${new Date(t.timestamp).toLocaleString()} • ${t.payment_status}`
        }))} />
      )}

      {tabValue === 4 && (
        <Box>
          {methods.map(m => (
            <Box key={m.id} sx={{ mb: 2, bgcolor: "white", p: 2, borderRadius: 2, boxShadow: 1 }}>
              <Typography>{m.payment_type} {m.is_default && <Chip label="Predeterminado" size="small" color="success" />}</Typography>
              <Typography variant="body2">{m.details}</Typography>
              <Box sx={{ mt: 1 }}>
                <IconButton onClick={() => setEditMethod(m)}><Edit /></IconButton>
                <IconButton onClick={() => setDeleteMethodId(m.id)}><Delete /></IconButton>
                {!m.is_default && <Button onClick={() => handleSetDefault(m.id)}>Hacer Predeterminado</Button>}
              </Box>
            </Box>
          ))}
          <MinimalForm onSubmit={handleAddMethod}>
            <TextField select label="Tipo" value={newMethod.payment_type} onChange={(e) => setNewMethod({ ...newMethod, payment_type: e.target.value })}>
              {paymentProviders.map(p => <MenuItem key={p.id} value={p.name}>{p.name}</MenuItem>)}
            </TextField>
            <TextField label="Detalles" value={newMethod.details} onChange={(e) => setNewMethod({ ...newMethod, details: e.target.value })} multiline rows={3} />
          </MinimalForm>
          <Dialog open={!!editMethod} onClose={() => setEditMethod(null)}>
            <DialogTitle>Editar Método</DialogTitle>
            <DialogContent>
              <MinimalForm onSubmit={handleEditMethod}>
                <TextField select label="Tipo" value={editMethod?.payment_type || ""} onChange={(e) => setEditMethod({ ...editMethod!, payment_type: e.target.value })}>
                  {paymentProviders.map(p => <MenuItem key={p.id} value={p.name}>{p.name}</MenuItem>)}
                </TextField>
                <TextField label="Detalles" value={editMethod?.details || ""} onChange={(e) => setEditMethod({ ...editMethod!, details: e.target.value })} multiline rows={3} />
              </MinimalForm>
            </DialogContent>
          </Dialog>
          <Dialog open={!!deleteMethodId} onClose={() => setDeleteMethodId(null)}>
            <DialogTitle>¿Eliminar Método?</DialogTitle>
            <DialogContent><Typography>¿Estás seguro?</Typography></DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteMethodId(null)}>Cancelar</Button>
              <Button onClick={() => handleDeleteMethod(deleteMethodId!)} color="error">Eliminar</Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}

      {tabValue === 5 && (
        <MinimalForm onSubmit={handlePurchase}>
          <TextField label="Créditos" type="number" value={credits} onChange={(e) => setCredits(e.target.value)} />
          <TextField label="Monto (USD)" type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
          <TextField select label="Método" value={methods.find(m => m.is_default)?.id || ""} onChange={(e) => handleSetDefault(parseInt(e.target.value))}>
            {methods.map(m => <MenuItem key={m.id} value={m.id}>{m.payment_type}</MenuItem>)}
          </TextField>
        </MinimalForm>
      )}

      {tabValue === 6 && (
        <Box>
          <MinimalForm onSubmit={handleAddIntegration}>
            <TextField label="Nombre" value={newIntegration.name} onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })} />
            <TextField label="Webhook URL" value={newIntegration.webhook_url} onChange={(e) => setNewIntegration({ ...newIntegration, webhook_url: e.target.value })} />
            <TextField label="Tipo de Evento" value={newIntegration.event_type} onChange={(e) => setNewIntegration({ ...newIntegration, event_type: e.target.value })} />
          </MinimalForm>
          <Table sx={{ bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {integrations.map(i => (
                <TableRow key={i.id}>
                  <TableCell>{i.name}</TableCell>
                  <TableCell>{i.active ? "Activo" : "Pendiente"}</TableCell>
                  <TableCell><IconButton onClick={() => handleDeleteIntegration(i.id)}><Delete /></IconButton></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Notifications */}
      {error && <Notification message={error} severity="error" onClose={() => setError(null)} />}
      {success && <Notification message={success} severity="success" onClose={() => setSuccess(null)} />}
    </Box>
  );
}