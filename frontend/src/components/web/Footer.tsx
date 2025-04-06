// src/components/Footer.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Grid,
  Typography,
  IconButton,
  Divider,
  useTheme,
  styled,
  Container,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Info,
  Gavel,
  ContactSupport,
  Home,
} from "@mui/icons-material";

const GlassFooter = styled("footer")(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2, 1),
  marginTop: "auto",
}));

const FooterLink = styled(Link)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
  textDecoration: "none",
  transition: "color 0.3s ease",
  "&:hover": {
    color: theme.palette.primary.main,
  },
}));

export default function Footer() {
  const theme = useTheme();
  const [loadTime, setLoadTime] = useState(0);
  const [currentTheme, setCurrentTheme] = useState(theme.palette.mode);

  useEffect(() => {
    const startTime = performance.now();
    const handleLoad = () => {
      const endTime = performance.now();
      setLoadTime(parseFloat((endTime - startTime).toFixed(2)));
    };

    window.addEventListener("load", handleLoad);
    return () => window.removeEventListener("load", handleLoad);
  }, []);

  const toggleTheme = () => {
    const newTheme = currentTheme === "light" ? "dark" : "light";
    setCurrentTheme(newTheme);
    // Aquí deberías implementar la lógica para cambiar el tema globalmente
  };

  return (
    <GlassFooter>
      <Container maxWidth="lg">
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Home color="primary" />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Neptuno
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              Tu framework SaaS para gestión de créditos y APIs.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Acerca de
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FooterLink href="/about/us">
                <Info fontSize="small" /> Sobre Nosotros
              </FooterLink>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Legal
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FooterLink href="/about/privacy">
                <Gavel fontSize="small" /> Privacidad
              </FooterLink>
              <FooterLink href="/about/legal">
                <Gavel fontSize="small" /> Términos Legales
              </FooterLink>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Soporte
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FooterLink href="/about/contact">
                <ContactSupport fontSize="small" /> Contacto
              </FooterLink>
            </Box>

            <Divider sx={{ my: 1 }} />

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="caption" color="textSecondary">
                Tiempo de carga: {loadTime} ms
              </Typography>
              <IconButton onClick={toggleTheme} color="inherit">
                {currentTheme === "light" ? <Brightness4 /> : <Brightness7 />}
              </IconButton>
            </Box>

            <Typography variant="caption" color="textSecondary">
              © {new Date().getFullYear()} Neptuno. Todos los derechos reservados.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </GlassFooter>
  );
}