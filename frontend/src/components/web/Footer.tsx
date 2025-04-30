// src/components/Footer.tsx
// src/components/Footer.tsx
"use client";

import { useEffect, useState } from "react";
import { consentUpdate, injectGTM, hasConsentExpired } from '../../lib/gtm';
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
  Code,
  Help,
  Build,
  LocationOn,
  Email,
  Phone,
} from "@mui/icons-material";

const doNotSellMyInfo = () => {
  consentUpdate(false, false);
  localStorage.setItem('cookie_consent', 'false');
  localStorage.setItem('analytics_consent', 'false');
  localStorage.setItem('ads_consent', 'false');
  localStorage.setItem('cookie_consent_timestamp', Date.now().toString());
  alert("Tus preferencias de privacidad han sido actualizadas.");
};

<button
  onClick={doNotSellMyInfo}
  style={{
    padding: '10px 15px',
    backgroundColor: '#f44336',
    color: 'white',
    borderRadius: '8px',
    marginTop: '20px',
    cursor: 'pointer'
  }}
>
  No vender ni compartir mi información personal
</button>


const GlassFooter = styled("footer")(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(4, 1),
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

const ContactItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
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
        <Grid container spacing={4}>
          {/* Columna 1: Logo, nombre, tagline y botón de tema */}
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
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
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Tu framework SaaS para gestión de créditos y APIs.
            </Typography>
            <IconButton 
              onClick={toggleTheme} 
              color="inherit"
              sx={{ mt: 1, border: `1px solid ${theme.palette.divider}`, borderRadius: 2 }}
            >
              {currentTheme === "light" ? <Brightness4 /> : <Brightness7 />}
              <Typography variant="caption" sx={{ ml: 1 }}>
                {currentTheme === "light" ? "Modo oscuro" : "Modo claro"}
              </Typography>
            </IconButton>
          </Grid>

          {/* Columna 2: Información */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Información
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <FooterLink href="/about/us">
                <Info fontSize="small" /> Sobre Nosotros
              </FooterLink>
              <FooterLink href="/about/privacy">
                <Gavel fontSize="small" /> Privacidad
              </FooterLink>
              <FooterLink href="/about/legal">
                <Gavel fontSize="small" /> Términos Legales
              </FooterLink>
            </Box>
          </Grid>

          {/* Columna 3: Soporte */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Soporte
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <FooterLink href="/api/docs">
                <Code fontSize="small" /> API Docs
              </FooterLink>
              <FooterLink href="/installation">
                <Build fontSize="small" /> Instalación
              </FooterLink>
              <FooterLink href="/help">
                <Help fontSize="small" /> Ayuda
              </FooterLink>
            </Box>
          </Grid>

          {/* Columna 4: Contacto */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Contacto
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <ContactItem>
                <LocationOn fontSize="small" />
                <Typography variant="body2">
                  Avenida Miguel Indurain, Murcia, 30008 España
                </Typography>
              </ContactItem>
              <FooterLink href="mailto:info@neptuno.com">
                <Email fontSize="small" /> info@neptuno.com
              </FooterLink>
              <FooterLink href="tel:+34987654321">
                <Phone fontSize="small" /> +34 987 654 321
              </FooterLink>
            </Box>
          </Grid>
        </Grid>

        {/* Pie del footer */}
        <Divider sx={{ my: 3 }} />
        <Box sx={{ 
          display: "flex", 
          flexDirection: { xs: "column", sm: "row" }, 
          alignItems: "center", 
          justifyContent: "space-between",
          gap: 2
        }}>
          <Typography variant="caption" color="textSecondary">
            Tiempo de carga: {loadTime} ms
          </Typography>
          <Typography variant="caption" color="textSecondary">
            © {new Date().getFullYear()} Neptuno. Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </GlassFooter>
  );
}