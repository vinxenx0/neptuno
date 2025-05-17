import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip } from "@mui/material";
import fetchAPI from "@/lib/api";
import { GlassCard } from "./StyledComponents";
import { useState } from "react";

export default function CouponsSection({ coupons, setCoupons, setCredits }) {
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleRedeem = async (couponId) => {
    try {
      const { data } = await fetchAPI(`/v1/coupons/redeem/${couponId}`, { method: "POST" });
      if (data) {
        setCoupons(coupons.map((c) => (c.id === couponId ? data : c)));
        const { data: info } = await fetchAPI("/whoami");
        setCredits((info as { credits: number }).credits);
        setSuccess("Cupón canjeado exitosamente");
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError("No se pudo canjear el cupón");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al canjear cupón");
    }
  };

  return (
    <GlassCard>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Mis Cupones</Typography>
        {!coupons || coupons.length === 0 ? (
          <Typography>No tienes cupones</Typography>
        ) : (
          <Table>
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
                  <TableCell>
                    <Chip label={coupon.status} color={coupon.status === "active" ? "success" : "error"} />
                  </TableCell>
                  <TableCell>
                    {coupon.status === "active" && (
                      <Button variant="contained" onClick={() => handleRedeem(coupon.id)}>
                        Canjear
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {success && <Typography color="success.main">{success}</Typography>}
        {error && <Typography color="error.main">{error}</Typography>}
      </Box>
    </GlassCard>
  );
}