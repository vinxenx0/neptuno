import { Box, Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip, Dialog, DialogTitle, DialogContent, TextField } from "@mui/material";
import { AddCircle, Edit, LocalActivity } from "@mui/icons-material";
import { Coupon, CouponType } from "@/lib/types";
import fetchAPI from "@/lib/api";

interface CouponsSectionProps {
  couponTypes: CouponType[];
  coupons: Coupon[];
  editCouponType: CouponType | null;
  setEditCouponType: (value: CouponType | null) => void;
  onSubmitCouponType: (e: React.FormEvent) => void;
  onDeleteCoupon: (id: number) => void;
}

const CouponsSection: React.FC<CouponsSectionProps> = ({
  couponTypes,
  coupons,
  editCouponType,
  setEditCouponType,
  onSubmitCouponType,
  onDeleteCoupon,
}) => {
  const handleGenerateTestCoupon = async (couponTypeId: number) => {
    try {
      const { data } = await fetchAPI<Coupon>("/v1/coupons/test", { method: "POST", data: { coupon_type_id: couponTypeId } });
      if (data) {
        // Actualizar estado de coupons en el componente padre si es necesario
        console.log("Cupón de prueba generado:", data);
      }
    } catch (err) {
      console.error("Error al generar cupón de prueba:", err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Cupones</Typography>
      <Button variant="contained" startIcon={<AddCircle />} onClick={() => setEditCouponType({ id: 0, name: "", description: "", credits: 0, active: true })} sx={{ mb: 2 }}>
        Nuevo Tipo de Cupón
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Créditos</TableCell>
            <TableCell>Activo</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {couponTypes.map((ct) => (
            <TableRow key={ct.id}>
              <TableCell>{ct.name}</TableCell>
              <TableCell>{ct.description || "Sin descripción"}</TableCell>
              <TableCell>{ct.credits}</TableCell>
              <TableCell>
                <Chip label={ct.active ? "Activo" : "Inactivo"} color={ct.active ? "success" : "error"} />
              </TableCell>
              <TableCell>
                <IconButton onClick={() => setEditCouponType(ct)} color="primary"><Edit /></IconButton>
                <Button variant="outlined" size="small" startIcon={<LocalActivity />} onClick={() => handleGenerateTestCoupon(ct.id)}>
                  Generar Prueba
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!editCouponType} onClose={() => setEditCouponType(null)}>
        <DialogTitle>{editCouponType?.id ? "Editar Tipo de Cupón" : "Nuevo Tipo de Cupón"}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={onSubmitCouponType} sx={{ mt: 2 }}>
            <TextField label="Nombre" fullWidth value={editCouponType?.name || ""} onChange={(e) => setEditCouponType({ ...editCouponType!, name: e.target.value })} margin="normal" />
            <TextField label="Descripción" fullWidth value={editCouponType?.description || ""} onChange={(e) => setEditCouponType({ ...editCouponType!, description: e.target.value })} margin="normal" />
            <TextField label="Créditos" type="number" fullWidth value={editCouponType?.credits || 0} onChange={(e) => setEditCouponType({ ...editCouponType!, credits: parseInt(e.target.value) || 0 })} margin="normal" />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>{editCouponType?.id ? "Actualizar" : "Crear"}</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CouponsSection;