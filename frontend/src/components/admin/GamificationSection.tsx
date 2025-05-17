import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, DialogTitle, DialogContent, TextField, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { AddCircle, Edit, Delete, ExpandMore } from "@mui/icons-material";
import { EventType, Badge } from "@/lib/types";
import { ConfigGlassCard } from "@/components/ui/Styled";

interface GamificationSectionProps {
  eventTypes: EventType[];
  badges: Badge[];
  editEventType: EventType | null;
  setEditEventType: (value: EventType | null) => void;
  editBadge: Badge | null;
  setEditBadge: (value: Badge | null) => void;
  onCreateEventType: (e: React.FormEvent) => void;
  onUpdateEventType: (e: React.FormEvent) => void;
  onDeleteEventType: (id: number) => void;
  onCreateBadge: (e: React.FormEvent) => void;
  onUpdateBadge: (e: React.FormEvent) => void;
  onDeleteBadge: (id: number) => void;
}

const GamificationSection: React.FC<GamificationSectionProps> = ({
  eventTypes,
  badges,
  editEventType,
  setEditEventType,
  editBadge,
  setEditBadge,
  onCreateEventType,
  onUpdateEventType,
  onDeleteEventType,
  onCreateBadge,
  onUpdateBadge,
  onDeleteBadge,
}) => {
  const groupedBadges = badges.reduce((acc, badge) => {
    const key = badge.event_type_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(badge);
    return acc;
  }, {} as Record<number, Badge[]>);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Gamificación</Typography>
      <ConfigGlassCard sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Tipos de Evento</Typography>
            <Button variant="contained" startIcon={<AddCircle />} onClick={() => setEditEventType({ id: 0, name: "", description: "", points_per_event: 0 })}>
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
                    <IconButton onClick={() => setEditEventType(et)} color="primary"><Edit /></IconButton>
                    <IconButton onClick={() => onDeleteEventType(et.id)} color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </ConfigGlassCard>
      <ConfigGlassCard>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6">Insignias</Typography>
            <Button variant="contained" startIcon={<AddCircle />} onClick={() => setEditBadge({ id: 0, name: "", description: "", event_type_id: eventTypes[0]?.id || 0, required_points: 0, user_type: "both" })} disabled={eventTypes.length === 0}>
              Nueva Insignia
            </Button>
          </Box>
          {eventTypes.map((eventType) => (
            <Accordion key={eventType.id} sx={{ background: "transparent", boxShadow: "none" }}>
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
                          <IconButton onClick={() => setEditBadge(badge)} color="primary"><Edit /></IconButton>
                          <IconButton onClick={() => onDeleteBadge(badge.id)} color="error"><Delete /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </ConfigGlassCard>

      <Dialog open={!!editEventType} onClose={() => setEditEventType(null)}>
        <DialogTitle>{editEventType?.id ? "Editar Tipo de Evento" : "Nuevo Tipo de Evento"}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={editEventType?.id ? onUpdateEventType : onCreateEventType} sx={{ mt: 2 }}>
            <TextField label="Nombre" fullWidth value={editEventType?.name || ""} onChange={(e) => setEditEventType({ ...editEventType!, name: e.target.value })} margin="normal" />
            <TextField label="Descripción" fullWidth value={editEventType?.description || ""} onChange={(e) => setEditEventType({ ...editEventType!, description: e.target.value })} margin="normal" />
            <TextField label="Puntos por evento" type="number" fullWidth value={editEventType?.points_per_event || 0} onChange={(e) => setEditEventType({ ...editEventType!, points_per_event: parseInt(e.target.value) || 0 })} margin="normal" />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>{editEventType?.id ? "Actualizar" : "Crear"}</Button>
          </Box>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editBadge} onClose={() => setEditBadge(null)}>
        <DialogTitle>{editBadge?.id ? "Editar Insignia" : "Nueva Insignia"}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={editBadge?.id ? onUpdateBadge : onCreateBadge} sx={{ mt: 2 }}>
            <TextField label="Nombre" fullWidth value={editBadge?.name || ""} onChange={(e) => setEditBadge({ ...editBadge!, name: e.target.value })} margin="normal" />
            <TextField label="Descripción" fullWidth value={editBadge?.description || ""} onChange={(e) => setEditBadge({ ...editBadge!, description: e.target.value })} margin="normal" />
            <TextField label="Puntos Requeridos" type="number" fullWidth value={editBadge?.required_points || 0} onChange={(e) => setEditBadge({ ...editBadge!, required_points: parseInt(e.target.value) || 0 })} margin="normal" />
            <TextField label="Tipo de Evento" select fullWidth value={editBadge?.event_type_id || 0} onChange={(e) => setEditBadge({ ...editBadge!, event_type_id: parseInt(e.target.value) })} margin="normal" SelectProps={{ native: true }}>
              {eventTypes.map((et) => (
                <option key={et.id} value={et.id}>{et.name}</option>
              ))}
            </TextField>
            <TextField label="Tipo de Usuario" select fullWidth value={editBadge?.user_type || "both"} onChange={(e) => setEditBadge({ ...editBadge!, user_type: e.target.value as any })} margin="normal" SelectProps={{ native: true }}>
              <option value="anonymous">Anónimo</option>
              <option value="registered">Registrado</option>
              <option value="both">Ambos</option>
            </TextField>
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>{editBadge?.id ? "Actualizar" : "Crear"}</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default GamificationSection;