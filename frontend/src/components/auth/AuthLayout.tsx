// frontend/src/components/auth/AuthLayout.tsx
import { Box, Grid, Typography, Paper } from "@mui/material";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 4, background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <Grid container spacing={4} sx={{ maxWidth: "1200px" }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, background: "rgba(255, 255, 255, 0.9)" }}>
            {children}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ textAlign: "center", p: 4 }}>
            <Image src="/logo.png" alt="Neptuno Logo" width={100} height={100} />
            <Typography variant="h4" sx={{ mt: 2, fontWeight: 600 }}>Bienvenido a Neptuno</Typography>
            <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
              La plataforma líder para gestionar tus compras y ventas de manera eficiente.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}