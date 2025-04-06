// src/app/page.tsx
"use client";

import { useAuth } from "@/lib/auth/context";
import fetchAPI from "@/lib/api";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Button,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Typography,
  Box,
  Container,
  Avatar,
  Chip,
  Divider,
  Grid,
  useTheme,
  styled
} from "@mui/material";
import {
  RocketLaunch,
  Api,
  Security,
  CreditScore,
  CheckCircle,
  ArrowForward,
  Bolt,
  LockOpen,
  Info,
  Cancel
} from "@mui/icons-material";
import { User } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";


// Styled Components actualizados
const HeroGradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)`,
  color: 'white',
  borderRadius: '24px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  padding: theme.spacing(8),
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '50%'
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  background: 'var(--background)',
  border: '1px solid var(--border)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
  }
}));

const EndpointButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(2),
  fontWeight: '600',
  textTransform: 'none',
  fontSize: '1rem',
  transition: 'all 0.2s ease'
}));


export default function LandingPage() {
    const { user, credits, setCredits } = useAuth();
    const theme = useTheme();
    const [localCredits, setLocalCredits] = useState<number>(0);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");
  
    useEffect(() => {
      if (!user) {
        const storedCredits = localStorage.getItem("anonCredits");
        const initialCredits = storedCredits ? parseInt(storedCredits) : 100;
        setLocalCredits(initialCredits);
        setCredits(initialCredits);
      }
    }, [user, setCredits]);
  
    // All handler functions remain exactly the same as in the original code
    const handleTestCreditConsumption = async () => {
      try {
        const response = await fetchAPI("/v1/api/test-credit-consumption", { method: "GET" });
        if (response.error) {
          setSnackbarMessage(typeof response.error === "string" ? response.error : "Error desconocido");
          setSnackbarSeverity("error");
          setSnackbarOpen(true);
        } else {
          if (user) {
            const userResponse = await fetchAPI<User>("/v1/users/me");
            if (userResponse.data) {
              setCredits(userResponse.data.credits);
            }
          } else {
            const newCredits = localCredits - 1;
            setLocalCredits(newCredits);
            setCredits(newCredits);
            localStorage.setItem("anonCredits", newCredits.toString());
          }
          setSnackbarMessage("Crédito consumido exitosamente");
          setSnackbarSeverity("success");
          setSnackbarOpen(true);
        }
      } catch (err) {
        console.error("Error al consumir crédito:", err);
        setSnackbarMessage("Error al consumir crédito");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
  
    const handleNoLoginTest = async () => {
      try {
        const response = await fetchAPI("/no-login/", { method: "GET" });
        if (response.error) {
          setSnackbarMessage(typeof response.error === "string" ? response.error : "Error desconocido");
          setSnackbarSeverity("error");
        } else {
          setSnackbarMessage("Consulta sin login realizada: " + (response.data as { message: string }).message);
          setSnackbarSeverity("success");
          if (!user) {
            const newCredits = localCredits - 1;
            setLocalCredits(newCredits);
            setCredits(newCredits);
            localStorage.setItem("anonCredits", newCredits.toString());
          }
        }
        setSnackbarOpen(true);
      } catch (err) {
        console.error("Error en consulta sin login:", err);
        setSnackbarMessage("Error en consulta sin login");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
  
    const handleRestrictedTest = async () => {
      try {
        const response = await fetchAPI("/restricted", { method: "GET" });
        if (response.error) {
          setSnackbarMessage(typeof response.error === "string" ? response.error : "Error desconocido");
          setSnackbarSeverity("error");
        } else {
          setSnackbarMessage("Consulta restringida realizada: " + (response.data as { message: string }).message);
          setSnackbarSeverity("success");
        }
        setSnackbarOpen(true);
      } catch (err) {
        console.error("Error en consulta restringida:", err);
        setSnackbarMessage("Error en consulta restringida");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
  
    const handleInfo = async () => {
      try {
        const response = await fetchAPI("/info", { method: "GET" });
        if (response.error) {
          setSnackbarMessage(typeof response.error === "string" ? response.error : "Error desconocido");
          setSnackbarSeverity("error");
        } else {
          setSnackbarMessage("Información obtenida: " + JSON.stringify(response.data));
          setSnackbarSeverity("success");
        }
        setSnackbarOpen(true);
      } catch (err) {
        console.error("Error al obtener información:", err);
        setSnackbarMessage("Error al obtener información");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
  
    const handleProgress = async () => {
      try {
        const response = await fetchAPI("/v1/gamification/me", { method: "GET" });
        if (response.error) {
          setSnackbarMessage(typeof response.error === "string" ? response.error : "Error desconocido");
          setSnackbarSeverity("error");
        } else {
          setSnackbarMessage("Información obtenida: " + JSON.stringify(response.data));
          setSnackbarSeverity("success");
        }
        setSnackbarOpen(true);
      } catch (err) {
        console.error("Error al obtener información:", err);
        setSnackbarMessage("Error al obtener información");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
  
    const handleSnackbarClose = () => {
      setSnackbarOpen(false);
    };
  
  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'var(--background)',
      pb: 8
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ mb: 8, mt: 4 }}>
          <HeroGradientCard>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 'bold',
                  mb: 3,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  color: 'white'
                }}
              >
                Bienvenido a Neptuno
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  maxWidth: '800px',
                  mx: 'auto',
                  opacity: 0.9,
                  color: 'white'
                }}
              >
                Tu Framework SaaS para gestionar créditos y APIs de forma sencilla y escalable.
              </Typography>

              {user ? (
                <Link href="/user/dashboard" passHref>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      px: 6,
                      py: 2,
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                      bgcolor: 'var(--primary)',
                      '&:hover': { bgcolor: 'var(--primary-hover)' }
                    }}
                  >
                    Ir al Dashboard
                  </Button>
                </Link>
              ) : (
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/user/auth/#register" passHref>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      sx={{
                        px: 6,
                        py: 2,
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        bgcolor: 'var(--primary)',
                        '&:hover': { bgcolor: 'var(--primary-hover)' }
                      }}
                    >
                      Registrarse
                    </Button>
                  </Link>
                  <Link href="/user/auth/#login" passHref>
                    <Button
                      variant="outlined"
                      size="large"
                      sx={{
                        px: 6,
                        py: 2,
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        borderColor: 'var(--primary)',
                        color: 'var(--primary)',
                        '&:hover': {
                          borderColor: 'var(--primary-hover)',
                          color: 'var(--primary-hover)',
                          bgcolor: 'rgba(13, 110, 253, 0.05)'
                        }
                      }}
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                </Box>
              )}
            </motion.div>
          </HeroGradientCard>
        </Box>

        {/* Features Section */}
        <Box sx={{ mb: 8 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              mb: 6,
              textAlign: 'center',
              color: 'var(--foreground)'
            }}
          >
            Potencia tus Proyectos
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                icon: <CreditScore sx={{ fontSize: 40, color: 'var(--primary)' }} />,
                title: "Gestión de Créditos",
                text: "Administra tus créditos fácilmente y prueba nuestras APIs con créditos gratuitos para usuarios nuevos."
              },
              {
                icon: <Api sx={{ fontSize: 40, color: 'var(--primary)' }} />,
                title: "APIs Potentes",
                text: "Accede a endpoints robustos y personalizables para integrar en tus proyectos."
              },
              {
                icon: <Security sx={{ fontSize: 40, color: 'var(--primary)' }} />,
                title: "Escalabilidad Segura",
                text: "Un framework diseñado para crecer contigo, con seguridad de primer nivel."
              }
            ].map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <motion.div whileHover={{ scale: 1.03 }}>
                  <FeatureCard>
                    <CardContent sx={{ textAlign: 'center', p: 4 }}>
                      <Avatar sx={{
                        width: 80,
                        height: 80,
                        mb: 3,
                        mx: 'auto',
                        bgcolor: 'rgba(13, 110, 253, 0.1)'
                      }}>
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h5" component="h3" sx={{ 
                        fontWeight: 'bold', 
                        mb: 2,
                        color: 'var(--foreground)'
                      }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: 'var(--secondary)',
                        lineHeight: 1.6
                      }}>
                        {feature.text}
                      </Typography>
                    </CardContent>
                  </FeatureCard>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Credits Section */}
        <Box sx={{
          textAlign: 'center',
          mb: 8,
          background: 'var(--background)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          p: 6,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h4" sx={{ 
              fontWeight: 'bold', 
              mb: 2,
              color: 'var(--foreground)'
            }}>
              <Box component="span" sx={{ color: 'var(--primary)' }}>
                {user ? credits : localCredits} créditos
              </Box> disponibles
            </Typography>
            <Typography variant="body1" sx={{ 
              mb: 4,
              color: 'var(--secondary)'
            }}>
              Prueba nuestro sistema de consumo de créditos ahora mismo
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleTestCreditConsumption}
              startIcon={<Bolt sx={{ color: 'white' }} />}
              sx={{
                px: 6,
                py: 2,
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                bgcolor: 'var(--primary)',
                '&:hover': { bgcolor: 'var(--primary-hover)' }
              }}
            >
              Probar Consumo de Crédito
            </Button>
          </motion.div>
        </Box>

        {/* API Endpoints Section */}
        <Box sx={{
          background: 'var(--background)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          p: 6,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
        }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              mb: 4,
              textAlign: 'center',
              color: 'var(--foreground)'
            }}
          >
            Prueba Nuestros Endpoints
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[
              { 
                label: '/v1/api/no-login/',
                icon: <LockOpen />,
                action: handleNoLoginTest,
                color: 'var(--primary)'
              },
              { 
                label: '/v1/api/restricted',
                icon: <Security />,
                action: handleRestrictedTest,
                color: 'var(--success)'
              },
              { 
                label: '/v1/api/info',
                icon: <Info />,
                action: handleInfo,
                color: 'var(--secondary)'
              },
              { 
                label: '/progress',
                icon: <Info />,
                action: handleProgress,
                color: 'var(--warning)'
              }
            ].map((endpoint, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <EndpointButton
                  fullWidth
                  onClick={endpoint.action}
                  startIcon={endpoint.icon}
                  sx={{
                    bgcolor: endpoint.color,
                    '&:hover': { 
                      bgcolor: endpoint.color,
                      opacity: 0.9 
                    }
                  }}
                >
                  {endpoint.label}
                </EndpointButton>
              </Grid>
            ))}
          </Grid>

          <Typography variant="body2" sx={{ 
            textAlign: 'center',
            color: 'var(--secondary)'
          }}>
            Cada prueba consume 1 crédito de tu cuenta {user ? '' : 'temporal'}
          </Typography>
        </Box>
      </Container>

      {/* Snackbar Notifications */}
      <AnimatePresence>
        {snackbarOpen && (
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Alert
                onClose={handleSnackbarClose}
                severity={snackbarSeverity}
                sx={{
                  width: '100%',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  bgcolor: 'var(--background)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)'
                }}
                iconMapping={{
                  success: <CheckCircle fontSize="inherit" color="success" />,
                  error: <Cancel fontSize="inherit" color="error" />
                }}
              >
                {snackbarMessage}
              </Alert>
            </motion.div>
          </Snackbar>
        )}
      </AnimatePresence>
    </Box>
  );
}