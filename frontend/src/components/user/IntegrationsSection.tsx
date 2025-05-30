import { useState } from "react";
import { Box, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";
import fetchAPI from "@/lib/api";
import { GlassCard } from "./StyledComponents";

export default function IntegrationsSection({ integrations, setIntegrations }) {
  const [newIntegration, setNewIntegration] = useState({ name: "", webhook_url: "", event_type: "" });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleAddIntegration = async (e) => {
    e.preventDefault();
    try {
      const { data } = await fetchAPI("/v1/integrations/", {
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

  const handleDeleteIntegration = async (id) => {
    try {
      await fetchAPI(`/v1/integrations/${id}`, { method: "DELETE" });
      setIntegrations(integrations.filter((i) => i.id !== id));
      setSuccess("Integración eliminada");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar integración");
    }
  };

  return (
    <GlassCard>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Integraciones</Typography>
        <Box component="form" onSubmit={handleAddIntegration} sx={{ mb: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Nombre"
            value={newIntegration.name}
            onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
            variant="outlined"
            size="small"
          />
          <TextField
            label="Webhook URL"
            value={newIntegration.webhook_url}
            onChange={(e) => setNewIntegration({ ...newIntegration, webhook_url: e.target.value })}
            variant="outlined"
            size="small"
          />
          <TextField
            label="Tipo de Evento"
            value={newIntegration.event_type}
            onChange={(e) => setNewIntegration({ ...newIntegration, event_type: e.target.value })}
            variant="outlined"
            size="small"
          />
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
        {success && <Typography color="success.main">{success}</Typography>}
        {error && <Typography color="error.main">{error}</Typography>}
      </Box>
    </GlassCard>
  );
}