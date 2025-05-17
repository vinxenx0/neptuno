import { useState } from "react";
import { Box, Typography, TextField, Button, List, ListItem, ListItemAvatar, ListItemText, Avatar, MenuItem } from "@mui/material";
import { AttachMoney, Payment, Security, Star } from "@mui/icons-material";
import fetchAPI from "@/lib/api";
import { GlassCard } from "./StyledComponents";

export default function BuyCreditsSection({ methods, setTransactions }) {
  const [credits, setCredits] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handlePurchase = async (e) => {
    e.preventDefault();
    try {
      const { data } = await fetchAPI("/v1/payments/purchase", {
        method: "POST",
        data: { credits: parseInt(credits), payment_amount: parseFloat(paymentAmount), payment_method: "stripe" },
      });
      setTransactions((prev) => [data, ...prev]);
      setCredits("");
      setPaymentAmount("");
      setSuccess("Créditos comprados");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al comprar créditos");
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 3, flexDirection: { xs: "column", md: "row" } }}>
      <GlassCard sx={{ flex: 1 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Comprar Créditos</Typography>
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
              fullWidth
              variant="outlined"
              size="small"
              disabled={methods.length === 0}
              helperText={methods.length === 0 ? "No hay métodos de pago disponibles" : "Selecciona un método"}
            >
              {methods.map((method) => (
                <MenuItem key={method.id} value={method.id}>
                  {method.payment_type} - {method.details} {method.is_default ? "(Predeterminado)" : ""}
                </MenuItem>
              ))}
            </TextField>
            <Button type="submit" variant="contained" color="primary" size="large" disabled={methods.length === 0}>
              Comprar Créditos
            </Button>
          </Box>
          {success && <Typography color="success.main">{success}</Typography>}
          {error && <Typography color="error.main">{error}</Typography>}
        </Box>
      </GlassCard>
      <GlassCard sx={{ flex: 1 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>Tarifas y Beneficios</Typography>
          <List>
            <ListItem>
              <ListItemAvatar><Avatar sx={{ bgcolor: "success.light" }}><Star /></Avatar></ListItemAvatar>
              <ListItemText primary="1 crédito = $1 USD" secondary="Tasa de cambio fija" />
            </ListItem>
            <ListItem>
              <ListItemAvatar><Avatar sx={{ bgcolor: "info.light" }}><Payment /></Avatar></ListItemAvatar>
              <ListItemText primary="Múltiples métodos de pago" secondary="Tarjetas, PayPal y más" />
            </ListItem>
            <ListItem>
              <ListItemAvatar><Avatar sx={{ bgcolor: "warning.light" }}><Security /></Avatar></ListItemAvatar>
              <ListItemText primary="Transacciones seguras" secondary="Encriptación SSL" />
            </ListItem>
          </List>
        </Box>
      </GlassCard>
    </Box>
  );
}