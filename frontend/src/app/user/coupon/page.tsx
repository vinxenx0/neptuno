// src/app/user/coupon/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";

export default function CouponPage() {
  const { coupons, setCoupons, setCredits } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!coupons) router.push("/");
  }, [coupons, router]);

  const handleRedeem = async (couponId: number) => {
    try {
      const { data } = await fetchAPI<any>(`/v1/coupons/redeem/${couponId}`, {
        method: "POST",
      });
      if (data) {
        setCoupons(coupons.map((c) => (c.id === couponId ? data : c)));
        const { data: info } = await fetchAPI<any>("/info");
        setCredits(info.credits);
        setSuccess("Cupón canjeado exitosamente");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al canjear cupón");
    }
  };

  return (
    <Box sx={{ p: 4, minHeight: "100vh", background: "#1a1a2e", color: "white" }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Mis Cupones
      </Typography>
      {coupons.length === 0 ? (
        <Typography>No tienes cupones disponibles</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Créditos</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.id}>
                <TableCell>{coupon.name}</TableCell>
                <TableCell>{coupon.description || "Sin descripción"}</TableCell>
                <TableCell>{coupon.credits}</TableCell>
                <TableCell>
                  <Chip
                    label={coupon.status}
                    color={coupon.status === "active" ? "success" : "error"}
                  />
                </TableCell>
                <TableCell>
                  {coupon.status === "active" && (
                    <Button
                      variant="contained"
                      onClick={() => handleRedeem(coupon.id)}
                    >
                      Canjear
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <Snackbar
        open={!!error}
        autoHideDuration={3000}
        onClose={() => setError(null)}
      >
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
      >
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Box>
  );
}