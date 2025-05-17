import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Switch, IconButton, Dialog, DialogTitle, DialogContent, TextField, FormControlLabel } from "@mui/material";
import { AddCircle, Edit, Delete } from "@mui/icons-material";
import { PaymentProvider } from "@/lib/types";
import { ConfigGlassCard } from "@/components/ui/Styled";

interface PaymentsSectionProps {
  paymentProviders: PaymentProvider[];
  editPaymentProvider: PaymentProvider | null;
  setEditPaymentProvider: (value: PaymentProvider | null) => void;
  onToggle: (id: number, active: boolean) => void;
  onCreate: (e: React.FormEvent) => void;
  onUpdate: (e: React.FormEvent) => void;
  onDelete: (id: number) => void;
}

const PaymentsSection: React.FC<PaymentsSectionProps> = ({
  paymentProviders,
  editPaymentProvider,
  setEditPaymentProvider,
  onToggle,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Pagos</Typography>
      <ConfigGlassCard>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button variant="contained" startIcon={<AddCircle />} onClick={() => setEditPaymentProvider({ id: 0, name: "", active: true })}>
              Nuevo Proveedor
            </Button>
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
              {paymentProviders.map((provider) => (
                <TableRow key={provider.id}>
                  <TableCell>{provider.name}</TableCell>
                  <TableCell>
                    <Switch checked={provider.active} onChange={() => onToggle(provider.id, provider.active)} />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => setEditPaymentProvider(provider)} color="primary"><Edit /></IconButton>
                    <IconButton onClick={() => onDelete(provider.id)} color="error"><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </ConfigGlassCard>

      <Dialog open={!!editPaymentProvider} onClose={() => setEditPaymentProvider(null)}>
        <DialogTitle>{editPaymentProvider?.id ? "Editar Proveedor" : "Nuevo Proveedor"}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={editPaymentProvider?.id ? onUpdate : onCreate} sx={{ mt: 2 }}>
            <TextField label="Nombre" fullWidth value={editPaymentProvider?.name || ""} onChange={(e) => setEditPaymentProvider({ ...editPaymentProvider!, name: e.target.value })} margin="normal" />
            <FormControlLabel
              control={<Switch checked={editPaymentProvider?.active || false} onChange={(e) => setEditPaymentProvider({ ...editPaymentProvider!, active: e.target.checked })} />}
              label="Activo"
              sx={{ mt: 2 }}
            />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>{editPaymentProvider?.id ? "Actualizar" : "Crear"}</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default PaymentsSection;