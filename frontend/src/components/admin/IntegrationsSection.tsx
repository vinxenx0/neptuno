import { Box, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Switch, IconButton, Select, MenuItem } from "@mui/material";
import { Delete } from "@mui/icons-material";
import { Integration } from "@/lib/types";

interface IntegrationsSectionProps {
  integrations: Integration[];
  newIntegration: { name: string; webhook_url: string; event_type: string };
  setNewIntegration: (value: { name: string; webhook_url: string; event_type: string }) => void;
  selectedUserId: number | null;
  setSelectedUserId: (value: number | null) => void;
  onAdd: (e: React.FormEvent) => void;
  onToggle: (id: number, active: boolean) => void;
  onDelete: (id: number) => void;
}

const IntegrationsSection: React.FC<IntegrationsSectionProps> = ({
  integrations,
  newIntegration,
  setNewIntegration,
  selectedUserId,
  setSelectedUserId,
  onAdd,
  onToggle,
  onDelete,
}) => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Integraciones</Typography>
      <Box component="form" onSubmit={onAdd} sx={{ mb: 2 }}>
        <TextField
          label="Nombre"
          value={newIntegration.name}
          onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
          fullWidth
          variant="outlined"
          size="small"
          sx={{ mb: 1 }}
        />
        <TextField
          label="Webhook URL"
          value={newIntegration.webhook_url}
          onChange={(e) => setNewIntegration({ ...newIntegration, webhook_url: e.target.value })}
          fullWidth
          variant="outlined"
          size="small"
          sx={{ mb: 1 }}
        />
        <TextField
          label="Tipo de Evento"
          value={newIntegration.event_type}
          onChange={(e) => setNewIntegration({ ...newIntegration, event_type: e.target.value })}
          fullWidth
          variant="outlined"
          size="small"
          sx={{ mb: 1 }}
        />
        <Button type="submit" variant="contained" color="primary">Añadir Integración</Button>
      </Box>
      <Select
        value={selectedUserId || ""}
        onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
        displayEmpty
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="">Todos los usuarios</MenuItem>
        {/* Opciones dinámicas de usuarios aquí */}
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
          {integrations
            .filter((i) => (selectedUserId ? i.user_id === selectedUserId : true))
            .map((integration) => (
              <TableRow key={integration.id}>
                <TableCell>{integration.name}</TableCell>
                <TableCell>{integration.user_id}</TableCell>
                <TableCell>
                  <Switch checked={integration.active} onChange={() => onToggle(integration.id, integration.active)} />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => onDelete(integration.id)} color="error">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default IntegrationsSection;