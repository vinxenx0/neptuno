// src/app/user/dashboard/page.tsx
// src/app/user/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import {
  AccountCircle,
  Lock,
  Payment,
  CreditCard,
  AddCircle,
  Delete,
  ExpandMore,
} from "@mui/icons-material";

// Interfaces
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

export default function UserDashboard() {
  const { user, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ email: "", username: "", ciudad: "", website: "" });
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [newMethod, setNewMethod] = useState({ payment_type: "stripe", details: "", is_default: false });
  const [credits, setCredits] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [methodsOpen, setMethodsOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/"); // router.push("/user/auth/#login");
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
        const [transRes, methRes] = await Promise.all([
          fetchAPI<CreditTransaction[]>("/v1/payments/transactions"),
          fetchAPI<PaymentMethod[]>("/v1/payments/methods"),
        ]);
        setTransactions(transRes.data || []);
        setMethods(methRes.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      }
    };
    fetchData();
  }, [user, router]);

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
      setNewMethod({ payment_type: "stripe", details: "", is_default: false });
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

  if (!user) return <Box sx={{ textAlign: "center", p: 4 }}>Cargando...</Box>;

  return (
    <Box sx={{ p: 6, minHeight: "100vh" }} className="container mx-auto">
      <Typography 
        component={motion.h1}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ 
          fontSize: "2rem", 
          fontWeight: "bold", 
          mb: 6, 
          textAlign: "center" 
        }}
      >
        Dashboard de {user.username}
      </Typography>

      <Grid container spacing={4}>
        {/* Perfil */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Perfil" avatar={<AccountCircle />} />
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
                    />
                    <TextField
                      label="Username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Ciudad"
                      type="text"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="Website"
                      type="text"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      fullWidth
                    />
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button type="submit" variant="contained" color="primary">
                        Guardar
                      </Button>
                      <Button onClick={() => setEditMode(false)} variant="outlined">
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
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <Typography><strong>Email:</strong> {user.email}</Typography>
                    <Typography><strong>Username:</strong> {user.username}</Typography>
                    <Typography><strong>Ciudad:</strong> {user.ciudad || "N/A"}</Typography>
                    <Typography><strong>Website:</strong> {user.website || "N/A"}</Typography>
                    <Typography><strong>Créditos:</strong> {user.credits ?? "N/A"}</Typography>
                    <Button onClick={() => setEditMode(true)} variant="contained" color="primary" sx={{ mt: 2 }}>
                      Editar Perfil
                    </Button>
                  </Box>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </Grid>

        {/* Cambio de Contraseña */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Cambiar Contraseña" avatar={<Lock />} />
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
                />
                <TextField
                  label="Nueva Contraseña"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  fullWidth
                  required
                />
                <Button type="submit" variant="contained" color="primary">
                  Cambiar Contraseña
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Transacciones */}
        <Grid item xs={12}>
          <Accordion expanded={transactionsOpen} onChange={() => setTransactionsOpen(!transactionsOpen)}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Transacciones</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {transactions.length === 0 ? (
                <Typography>No hay transacciones.</Typography>
              ) : (
                transactions.map((t) => (
                  <Box key={t.id} sx={{ p: 2, borderBottom: "1px solid #ddd" }}>
                    <Typography><strong>{t.transaction_type}</strong> de {Math.abs(t.amount)} créditos</Typography>
                    <Typography>Monto: ${t.payment_amount?.toFixed(2) || "N/A"}</Typography>
                    <Typography>Método: {t.payment_method || "N/A"}</Typography>
                    <Typography>Estado: {t.payment_status}</Typography>
                    <Typography variant="caption">{new Date(t.timestamp).toLocaleString()}</Typography>
                  </Box>
                ))
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Métodos de Pago */}
        <Grid item xs={12}>
          <Accordion expanded={methodsOpen} onChange={() => setMethodsOpen(!methodsOpen)}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Métodos de Pago</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {methods.map((m) => (
                <Box key={m.id} sx={{ p: 2, borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography><strong>{m.payment_type}</strong></Typography>
                    <Typography>{m.details}</Typography>
                    {m.is_default && <Typography color="success.main">Predeterminado</Typography>}
                  </Box>
                  {!m.is_default && (
                    <Button onClick={() => handleSetDefault(m.id)} variant="outlined">
                      Hacer Predeterminado
                    </Button>
                  )}
                </Box>
              ))}
              <Box 
                component="form" 
                onSubmit={handleAddMethod} 
                sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  label="Tipo"
                  select
                  value={newMethod.payment_type}
                  onChange={(e) => setNewMethod({ ...newMethod, payment_type: e.target.value })}
                  fullWidth
                >
                  <MenuItem value="stripe">Stripe</MenuItem>
                </TextField>
                <TextField
                  label="Detalles"
                  value={newMethod.details}
                  onChange={(e) => setNewMethod({ ...newMethod, details: e.target.value })}
                  fullWidth
                  required
                />
                <Button type="submit" variant="contained" color="primary">
                  Añadir Método
                </Button>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Compra de Créditos */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Comprar Créditos" avatar={<CreditCard />} />
            <CardContent>
              <Box 
                component="form" 
                onSubmit={handlePurchase} 
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  label="Créditos"
                  type="number"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  fullWidth
                  required
                />
                <TextField
                  label="Monto (USD)"
                  type="number"
                  inputProps={{ step: "0.01" }}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  fullWidth
                  required
                />
                <Button type="submit" variant="contained" color="primary">
                  Comprar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Acciones */}
      <Box sx={{ mt: 6, display: "flex", gap: 2 }}>
        <Button onClick={logout} variant="outlined" color="secondary" fullWidth>
          Cerrar Sesión
        </Button>
        <Button onClick={handleDeleteAccount} variant="contained" color="error" fullWidth>
          Eliminar Cuenta
        </Button>
      </Box>

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
    </Box>
  );
}