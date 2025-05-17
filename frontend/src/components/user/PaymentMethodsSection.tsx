import { useState } from "react";
import { Box, Typography, List, ListItem, ListItemAvatar, ListItemText, Avatar, IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Accordion, AccordionSummary, AccordionDetails, MenuItem, Chip } from "@mui/material";
import { Edit, Delete, ExpandMore, AddCircle, Star, CreditCard } from "@mui/icons-material";
import fetchAPI from "@/lib/api";
import { GlassCard } from "./StyledComponents";

export default function PaymentMethodsSection({ methods, setMethods, paymentProviders }) {
  const [newMethod, setNewMethod] = useState({ payment_type: paymentProviders[0]?.name || "", details: "", is_default: false });
  const [editMethod, setEditMethod] = useState(null);
  const [deleteMethodId, setDeleteMethodId] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleAddMethod = async (e) => {
    e.preventDefault();
    try {
      const { data } = await fetchAPI("/v1/payments/methods", { method: "POST", data: newMethod });
      setMethods([...methods, data]);
      setNewMethod({ payment_type: paymentProviders[0]?.name || "", details: "", is_default: false });
      setSuccess("Método añadido");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al añadir método");
    }
  };

  const handleEditMethod = async (e) => {
    e.preventDefault();
    if (!editMethod) return;
    try {
      const { data } = await fetchAPI(`/v1/payments/methods/${editMethod.id}`, { method: "PUT", data: editMethod });
      setMethods(methods.map((m) => (m.id === data.id ? data : m)));
      setEditMethod(null);
      setSuccess("Método actualizado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar método");
    }
  };

  const handleDeleteMethod = async (id) => {
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

  const handleSetDefault = async (id) => {
    try {
      await fetchAPI(`/v1/payments/methods/${id}/default`, { method: "PUT" });
      setMethods(methods.map((m) => ({ ...m, is_default: m.id === id })));
      setSuccess("Método predeterminado actualizado");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al establecer predeterminado");
    }
  };

  return (
    <GlassCard>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Métodos de Pago</Typography>
        {methods.length > 0 && (
          <List sx={{ mb: 3 }}>
            {methods.map((m) => (
              <ListItem key={m.id}>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: m.is_default ? "success.main" : "grey.300" }}>
                    {m.is_default ? <Star /> : <CreditCard />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={<Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography sx={{ mr: 1 }}>{m.payment_type}</Typography>
                    {m.is_default && <Chip label="Predeterminado" size="small" color="success" variant="outlined" />}
                  </Box>}
                  secondary={m.details}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton onClick={() => setEditMethod(m)} color="primary"><Edit /></IconButton>
                  <IconButton onClick={() => setDeleteMethodId(m.id)} color="error"><Delete /></IconButton>
                  {!m.is_default && (
                    <Button onClick={() => handleSetDefault(m.id)} variant="outlined" size="small">
                      Hacer Predeterminado
                    </Button>
                  )}
                </Box>
              </ListItem>
            ))}
          </List>
        )}
        <Accordion>
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
                  <MenuItem key={provider.id} value={provider.name}>{provider.name}</MenuItem>
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
              <Button type="submit" variant="contained" color="primary" startIcon={<AddCircle />}>
                Añadir Método
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
        {success && <Typography color="success.main">{success}</Typography>}
        {error && <Typography color="error.main">{error}</Typography>}

        <Dialog open={!!editMethod} onClose={() => setEditMethod(null)}>
          <DialogTitle>Editar Método de Pago</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleEditMethod} sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
              <TextField
                label="Tipo"
                select
                value={editMethod?.payment_type || ""}
                onChange={(e) => setEditMethod({ ...editMethod, payment_type: e.target.value })}
                fullWidth
                variant="outlined"
                size="small"
              >
                {paymentProviders.map((provider) => (
                  <MenuItem key={provider.id} value={provider.name}>{provider.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Detalles"
                value={editMethod?.details || ""}
                onChange={(e) => setEditMethod({ ...editMethod, details: e.target.value })}
                fullWidth
                required
                variant="outlined"
                size="small"
                multiline
                rows={3}
              />
              <DialogActions>
                <Button onClick={() => setEditMethod(null)} variant="outlined">Cancelar</Button>
                <Button type="submit" variant="contained" color="primary">Guardar</Button>
              </DialogActions>
            </Box>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteMethodId} onClose={() => setDeleteMethodId(null)}>
          <DialogTitle>¿Eliminar Método de Pago?</DialogTitle>
          <DialogContent>
            <Typography>Esta acción es irreversible. ¿Estás seguro?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteMethodId(null)} variant="outlined">Cancelar</Button>
            <Button onClick={() => handleDeleteMethod(deleteMethodId)} variant="contained" color="error">Eliminar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </GlassCard>
  );
}