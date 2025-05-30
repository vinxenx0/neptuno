import { Box, Typography, TextField, Button, Table, TableHead, TableRow, TableCell, TableBody, Switch, IconButton } from "@mui/material";
import { Delete } from "@mui/icons-material";

interface OriginsSectionProps {
  corsEnabled: boolean | null;
  origins: string[];
  newOrigin: string;
  setNewOrigin: (value: string) => void;
  onToggleCors: () => void;
  onAddOrigin: (e: React.FormEvent) => void;
  onDeleteOrigin: (origin: string) => void;
}

const OriginsSection: React.FC<OriginsSectionProps> = ({
  corsEnabled,
  origins,
  newOrigin,
  setNewOrigin,
  onToggleCors,
  onAddOrigin,
  onDeleteOrigin,
}) => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Orígenes</Typography>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Orígenes Permitidos</Typography>
        {corsEnabled === null ? (
          <Typography>Cargando...</Typography>
        ) : (
          <Switch checked={corsEnabled} onChange={onToggleCors} />
        )}
      </Box>
      {corsEnabled && (
        <Box component="form" onSubmit={onAddOrigin} sx={{ mb: 2 }}>
          <TextField
            label="Nuevo Origen"
            value={newOrigin}
            onChange={(e) => setNewOrigin(e.target.value)}
            fullWidth
            variant="outlined"
            size="small"
          />
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 1 }}>Añadir Origen</Button>
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
{(Array.isArray(origins) ? origins : []).map((origin) => (
  <TableRow key={origin}>
    <TableCell>{origin}</TableCell>
    <TableCell>...</TableCell>
  </TableRow>
))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default OriginsSection;