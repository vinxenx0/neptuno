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


// Styled Components
const HeroGradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: '24px',
  boxShadow: theme.shadows[10],
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
  boxShadow: theme.shadows[5],
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10]
  }
}));

const EndpointButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(2),
  fontWeight: 'bold',
  textTransform: 'none',
  fontSize: '1rem'
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
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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
                  fontSize: { xs: '2.5rem', md: '3.5rem' }
                }}
              >
                Bienvenido a <span style={{ color: theme.palette.secondary.light }}>Neptuno</span>
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  maxWidth: '800px',
                  mx: 'auto',
                  opacity: 0.9
                }}
              >
                Tu Framework SaaS para gestionar créditos y APIs de forma sencilla y escalable.
              </Typography>

              {user ? (
                <Link href="/user/dashboard" passHref>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      px: 6,
                      py: 2,
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '1.1rem'
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
                      color="secondary"
                      size="large"
                      sx={{
                        px: 6,
                        py: 2,
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '1.1rem'
                      }}
                    >
                      Registrarse
                    </Button>
                  </Link>
                  <Link href="/user/auth/#login" passHref>
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="large"
                      sx={{
                        px: 6,
                        py: 2,
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        borderWidth: '2px',
                        '&:hover': {
                          borderWidth: '2px',
                          backgroundColor: 'rgba(255, 255, 255, 0.1)'
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
              color: theme.palette.text.primary
            }}
          >
            Potencia tus Proyectos
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <motion.div whileHover={{ scale: 1.03 }}>
                <FeatureCard>
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Avatar sx={{
                      bgcolor: theme.palette.primary.light,
                      width: 80,
                      height: 80,
                      mb: 3,
                      mx: 'auto'
                    }}>
                      <CreditScore sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Gestión de Créditos
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Administra tus créditos fácilmente y prueba nuestras APIs con créditos gratuitos para usuarios nuevos.
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={4}>
              <motion.div whileHover={{ scale: 1.03 }}>
                <FeatureCard>
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Avatar sx={{
                      bgcolor: theme.palette.info.light,
                      width: 80,
                      height: 80,
                      mb: 3,
                      mx: 'auto'
                    }}>
                      <Api sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                      APIs Potentes
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Accede a endpoints robustos y personalizables para integrar en tus proyectos.
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={4}>
              <motion.div whileHover={{ scale: 1.03 }}>
                <FeatureCard>
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <Avatar sx={{
                      bgcolor: theme.palette.success.light,
                      width: 80,
                      height: 80,
                      mb: 3,
                      mx: 'auto'
                    }}>
                      <Security sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
                      Escalabilidad Segura
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Un framework diseñado para crecer contigo, con seguridad de primer nivel.
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </motion.div>
            </Grid>
          </Grid>
        </Box>

        {/* Credits Section */}
        <Box sx={{
          textAlign: 'center',
          mb: 8,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          p: 6,
          boxShadow: theme.shadows[3]
        }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
              <Box component="span" sx={{ color: theme.palette.primary.main }}>
                {user ? credits : localCredits} créditos
              </Box> disponibles
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Prueba nuestro sistema de consumo de créditos ahora mismo
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleTestCreditConsumption}
              startIcon={<Bolt />}
              sx={{
                px: 6,
                py: 2,
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '1.1rem'
              }}
            >
              Probar Consumo de Crédito
            </Button>
          </motion.div>
        </Box>

        {/* API Endpoints Section */}
        <Box sx={{
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          p: 6,
          boxShadow: theme.shadows[3]
        }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              mb: 4,
              textAlign: 'center'
            }}
          >
            Prueba Nuestros Endpoints
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <EndpointButton
                fullWidth
                variant="contained"
                color="info"
                onClick={handleNoLoginTest}
                startIcon={<LockOpen />}
              >
                /v1/api/no-login/
              </EndpointButton>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <EndpointButton
                fullWidth
                variant="contained"
                color="success"
                onClick={handleRestrictedTest}
                startIcon={<Security />}
              >
                /v1/api/restricted
              </EndpointButton>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <EndpointButton
                fullWidth
                variant="contained"
                color="secondary"
                onClick={handleInfo}
                startIcon={<Info />}
              >
                /v1/api/info
              </EndpointButton>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <EndpointButton
                fullWidth
                variant="contained"
                color="secondary"
                onClick={handleProgress}
                startIcon={<Info />}
              >
                /progress
              </EndpointButton>
            </Grid>
          </Grid>

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
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
                  boxShadow: theme.shadows[6]
                }}
                iconMapping={{
                  success: <CheckCircle fontSize="inherit" />,
                  error: <Cancel fontSize="inherit" />
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