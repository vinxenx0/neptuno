// frontend/src/app/page.tsx
"use client";

import { useAuth } from "@/lib/auth/context";
import fetchAPI from "@/lib/api";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
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
  styled,
  TextField,
  Checkbox,
  FormControlLabel,
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
  Cancel,
  Star,
  ShoppingCart,
} from "@mui/icons-material";
import { User, Coupon, InfoResponse, Badge } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import SEO from "@/components/seo/MetaTags";

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: "32px",
  padding: theme.spacing(10),
  textAlign: "center",
  position: "relative",
  overflow: "hidden",
  boxShadow: theme.shadows[15],
  marginBottom: theme.spacing(8),
  "&:before": {
    content: '""',
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "50%",
    zIndex: 0,
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: theme.shadows[8],
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[12],
  },
  padding: theme.spacing(4),
  textAlign: "center",
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "12px",
  padding: theme.spacing(2, 4),
  fontWeight: "bold",
  textTransform: "none",
  fontSize: "1.1rem",
  boxShadow: theme.shadows[4],
  "&:hover": {
    boxShadow: theme.shadows[8],
  },
}));

const EndpointButton = styled(Button)(({ theme }) => ({
  borderRadius: "12px",
  padding: theme.spacing(1.5, 3),
  fontWeight: "bold",
  textTransform: "none",
  fontSize: "1rem",
  width: "100%",
}));

const InteractiveCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  boxShadow: theme.shadows[6],
  padding: theme.spacing(4),
  background: "rgba(255, 255, 255, 0.95)",
  backdropFilter: "blur(10px)",
}));

export default function SplashPage() {
  const { user, credits, setCredits, setGamification, coupons, setCoupons } =
    useAuth();
  const theme = useTheme();

  // Landing Page States
  const [localCredits, setLocalCredits] = useState<number>(0);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );

  // Ejemplos Page States
  const [registroFields, setRegistroFields] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [newsletterSubs, setNewsletterSubs] = useState({
    tech: false,
    marketing: false,
    design: false,
  });
  const [encuestaAnswers, setEncuestaAnswers] = useState<number[]>([]);
  const [checkinDone, setCheckinDone] = useState(false);
  const [icpFields, setIcpFields] = useState({
    company: "",
    role: "",
    industry: "",
  });
  const [tutorialLessons, setTutorialLessons] = useState([false, false, false]);
  const [message, setMessage] = useState<string | null>(null);

  // Landing Page Effects
  useEffect(() => {
    if (!user) {
      const storedCredits = localStorage.getItem("anonCredits");
      const initialCredits = storedCredits ? parseInt(storedCredits) : 10;
      setLocalCredits(initialCredits);
      setCredits(initialCredits);
    }
  }, [user, setCredits]);

  // Ejemplos Page Effects
  const updateGamification = useCallback(async () => {
    const { data } = await fetchAPI<InfoResponse>("/whoami");
    if (data?.gamification) {
      const totalPoints = data.gamification.reduce(
        (sum, g) => sum + g.points,
        0
      );
      const badges = data.gamification
        .map((g) => g.badge)
        .filter((b) => b !== null) as Badge[];
      setGamification({ points: totalPoints, badges });
    }
  }, [setGamification]);

  useEffect(() => {
    updateGamification();
  }, [updateGamification]);

  // Landing Page Handlers
  const handleTestCreditConsumption = async () => {
    try {
      const response = await fetchAPI("/v1/test/test-credit-consumption", {
        method: "GET",
      });
      if (response.error) {
        setSnackbarMessage(
          typeof response.error === "string"
            ? response.error
            : "Error desconocido"
        );
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

  const handleAddToCart = async () => {
    const productId = 1; // ID del producto de ejemplo (Smartphone)
    await fetchAPI("/v1/marketplace/cart", {
      method: "POST",
      data: { product_id: productId, quantity: 1 },
    });
    setSnackbarMessage("Producto añadido al carrito");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleNoLoginTest = async () => {
    try {
      const response = await fetchAPI("/v1/test/no-login/", { method: "GET" });
      if (response.error) {
        setSnackbarMessage(
          typeof response.error === "string"
            ? response.error
            : "Error desconocido"
        );
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage(
          "Consulta sin login realizada: " +
            (response.data as { message: string }).message
        );
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
      const response = await fetchAPI("/v1/test/restricted", { method: "GET" });
      if (response.error) {
        setSnackbarMessage(
          typeof response.error === "string"
            ? response.error
            : "Error desconocido"
        );
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage(
          "Consulta restringida realizada: " +
            (response.data as { message: string }).message
        );
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
      const response = await fetchAPI("/whoami", { method: "GET" });
      if (response.error) {
        setSnackbarMessage(
          typeof response.error === "string"
            ? response.error
            : "Error desconocido"
        );
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage(
          "Información obtenida: " + JSON.stringify(response.data)
        );
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
        setSnackbarMessage(
          typeof response.error === "string"
            ? response.error
            : "Error desconocido"
        );
        setSnackbarSeverity("error");
      } else {
        setSnackbarMessage(
          "Información obtenida: " + JSON.stringify(response.data)
        );
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
    setMessage(null);
  };

  // Ejemplos Page Handlers
  const handleGenerateCoupon = async () => {
    try {
      const { data } = await fetchAPI<Coupon>(
        "/v1/coupons/generate-demo-coupon?credits=5",
        {
          method: "POST",
        }
      );
      if (data) {
        setCoupons([...coupons, data]);
        setMessage("Cupón generado");
      } else {
        setMessage("Error: No se recibió el cupón");
      }
    } catch (err) {
      setMessage("Error al generar cupón");
      console.error(err);
    }
  };

  const handleRegistroChange = async (
    field: keyof typeof registroFields,
    value: string
  ) => {
    setRegistroFields((prev) => ({ ...prev, [field]: value }));
    if (value) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 1 },
      });
      updateGamification();
      setMessage("¡Ganaste 1 punto por completar un campo!");
    }
    if (registroFields.name && registroFields.email && registroFields.phone) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 2 },
      });
      updateGamification();
      setMessage("¡Completaste el registro y ganaste 10 puntos!");
    }
  };

  const handleNewsletterChange = async (
    newsletter: keyof typeof newsletterSubs
  ) => {
    setNewsletterSubs((prev) => ({ ...prev, [newsletter]: !prev[newsletter] }));
    if (!newsletterSubs[newsletter]) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 3 },
      });
      updateGamification();
      setMessage("¡Ganaste 2 puntos por suscribirte a una newsletter!");
    }
    if (
      newsletterSubs.tech &&
      newsletterSubs.marketing &&
      newsletterSubs.design
    ) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 4 },
      });
      updateGamification();
      setMessage(
        "¡Te suscribiste a todas las newsletters y ganaste 15 puntos!"
      );
    }
  };

  const handleEncuestaAnswer = async (answer: number) => {
    setEncuestaAnswers((prev) => [...prev, answer]);
    await fetchAPI("/v1/gamification/events", {
      method: "POST",
      data: { event_type_id: 5 },
    });
    updateGamification();
    setMessage("¡Ganaste 1 punto por responder una pregunta!");
  };

  const handleEncuestaComplete = async () => {
    if (encuestaAnswers.length === 3) {
      try {
        await fetchAPI("/v1/gamification/events", {
          method: "POST",
          data: { event_type_id: 6 },
        });
        updateGamification();
        const { data: coupon } = await fetchAPI<Coupon>("/v1/coupons/", {
          method: "POST",
          data: {
            name: "Recompensa Encuesta",
            description: "Cupón por completar la encuesta",
            credits: 10,
            active: true,
            unique_identifier: `SURVEY-${Date.now()}`,
          },
        });
        if (coupon) {
          setCoupons([...coupons, coupon]);
          setMessage(
            "¡Completaste la encuesta y ganaste 10 puntos + un cupón de 10 créditos!"
          );
        } else {
          setMessage("¡Completaste la encuesta y ganaste 10 puntos!");
        }
      } catch (err) {
        setMessage("Error al procesar la encuesta");
        console.error(err);
      }
    }
  };

  const handleCheckin = async () => {
    setCheckinDone(true);
    await fetchAPI("/v1/gamification/events", {
      method: "POST",
      data: { event_type_id: 7 },
    });
    updateGamification();
    setMessage("¡Ganaste 5 puntos por hacer check-in!");
  };

  const handleIcpChange = async (
    field: keyof typeof icpFields,
    value: string
  ) => {
    setIcpFields((prev) => ({ ...prev, [field]: value }));
    if (value) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 8 },
      });
      updateGamification();
      setMessage("¡Ganaste 1 punto por completar un campo del ICP!");
    }
    if (icpFields.company && icpFields.role && icpFields.industry) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 9 },
      });
      updateGamification();
      setMessage("¡Completaste tu ICP y ganaste 10 puntos!");
    }
  };

  const handleLessonComplete = async (index: number) => {
    setTutorialLessons((prev) => {
      const newLessons = [...prev];
      newLessons[index] = true;
      return newLessons;
    });
    await fetchAPI("/v1/gamification/events", {
      method: "POST",
      data: { event_type_id: 10 },
    });
    updateGamification();
    setMessage("¡Ganaste 3 puntos por completar una lección!");
  };

  return (
    <>
      <SEO
        title="Neptuno - Potencia tu Negocio con APIs y Gamificación"
        description="Construye aplicaciones escalables con Neptuno: gestiona créditos, APIs y gamificación para maximizar el engagement y las conversiones."
        keywords="SaaS, APIs, gamificación, créditos, engagement, escalabilidad"
      />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e3e8f2 100%)",
          pb: 12,
        }}
      >
        <Container maxWidth="lg">
          {/* Hero Section */}
          <HeroSection>
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: 3,
                  fontSize: { xs: "2.8rem", md: "4.5rem" },
                  lineHeight: 1.2,
                }}
              >
                Neptuno: Tu SaaS para <br />
                <span style={{ color: theme.palette.secondary.light }}>
                  APIs y Gamificación
                </span>
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 5,
                  maxWidth: "900px",
                  mx: "auto",
                  opacity: 0.9,
                  fontWeight: 300,
                }}
              >
                Crea aplicaciones modernas con nuestras APIs robustas, gestiona
                créditos fácilmente y aumenta el engagement con gamificación
                integrada. ¡Empieza gratis hoy!
              </Typography>
              {user ? (
                <Link href="/user/dashboard" passHref>
                  <ActionButton
                    variant="contained"
                    color="secondary"
                    size="large"
                    endIcon={<ArrowForward />}
                  >
                    Ir al Dashboard
                  </ActionButton>
                </Link>
              ) : (
                <Box
                  sx={{
                    display: "flex",
                    gap: 3,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Link href="/user/auth/#register" passHref>
                    <ActionButton
                      variant="contained"
                      color="secondary"
                      size="large"
                    >
                      Comienza Gratis
                    </ActionButton>
                  </Link>
                  <Link href="/user/auth/#login" passHref>
                    <ActionButton
                      variant="outlined"
                      color="inherit"
                      size="large"
                      sx={{
                        borderWidth: "2px",
                        "&:hover": { borderWidth: "2px" },
                      }}
                    >
                      Iniciar Sesión
                    </ActionButton>
                  </Link>
                </Box>
              )}
            </motion.div>
          </HeroSection>

          {/* Features Section */}
          <Box sx={{ mb: 12, textAlign: "center" }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, mb: 6, color: theme.palette.text.primary }}
            >
              Todo lo que Necesitas para Escalar
            </Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <FeatureCard>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.light,
                        width: 70,
                        height: 70,
                        mb: 3,
                        mx: "auto",
                      }}
                    >
                      <CreditScore sx={{ fontSize: 36 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                      Gestión de Créditos
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Controla tus créditos con facilidad y prueba nuestras APIs
                      con 10 créditos gratis al registrarte.
                    </Typography>
                  </FeatureCard>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={4}>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <FeatureCard>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.info.light,
                        width: 70,
                        height: 70,
                        mb: 3,
                        mx: "auto",
                      }}
                    >
                      <Api sx={{ fontSize: 36 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                      APIs de Alto Rendimiento
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Integra endpoints rápidos y personalizables para potenciar
                      tus aplicaciones.
                    </Typography>
                  </FeatureCard>
                </motion.div>
              </Grid>
              <Grid item xs={12} md={4}>
                <motion.div whileHover={{ scale: 1.05 }}>
                  <FeatureCard>
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.success.light,
                        width: 70,
                        height: 70,
                        mb: 3,
                        mx: "auto",
                      }}
                    >
                      <Security sx={{ fontSize: 36 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                      Escalabilidad Segura
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Crece sin límites con un framework seguro diseñado para tu
                      éxito.
                    </Typography>
                  </FeatureCard>
                </motion.div>
              </Grid>
            </Grid>
          </Box>

          {/* Interactive Demo Section */}
          <Box sx={{ mb: 12 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 6,
                textAlign: "center",
                color: theme.palette.text.primary,
              }}
            >
              Prueba Neptuno en Acción
            </Typography>
            <Grid container spacing={4}>
              {/* Credits Demo */}
              <Grid item xs={12} md={6}>
                <InteractiveCard>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Sistema de Créditos
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    Experimenta nuestro sistema de créditos: realiza una acción
                    y consume un crédito en tiempo real.
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    <Box
                      component="span"
                      sx={{ color: theme.palette.primary.main }}
                    >
                      {user ? credits : localCredits} créditos
                    </Box>{" "}
                    disponibles
                  </Typography>
                  <ActionButton
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleTestCreditConsumption}
                    startIcon={<Bolt />}
                  >
                    Consumir 1 Crédito
                  </ActionButton>
                </InteractiveCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <InteractiveCard>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Prueba el Marketplace
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    Añade un producto de ejemplo a tu carrito y prueba el
                    proceso de checkout.
                  </Typography>
                  <ActionButton
                    variant="contained"
                    color="primary"
                    onClick={handleAddToCart}
                    startIcon={<ShoppingCart />}
                  >
                    Añadir al Carrito
                  </ActionButton>
                </InteractiveCard>
              </Grid>

              {/* API Endpoints Demo */}
              <Grid item xs={12} md={6}>
                <InteractiveCard>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Explora Nuestros Endpoints
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    Interactúa con nuestras APIs en tiempo real. Cada acción
                    consume 1 crédito.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <EndpointButton
                        variant="contained"
                        color="info"
                        onClick={handleNoLoginTest}
                        startIcon={<LockOpen />}
                      >
                        /v1/test/no-login/
                      </EndpointButton>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <EndpointButton
                        variant="contained"
                        color="success"
                        onClick={handleRestrictedTest}
                        startIcon={<Security />}
                      >
                        /v1/test/restricted
                      </EndpointButton>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <EndpointButton
                        variant="contained"
                        color="secondary"
                        onClick={handleInfo}
                        startIcon={<Info />}
                      >
                        /v1/test/whoami
                      </EndpointButton>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <EndpointButton
                        variant="contained"
                        color="secondary"
                        onClick={handleProgress}
                        startIcon={<Info />}
                      >
                        /progress
                      </EndpointButton>
                    </Grid>
                  </Grid>
                </InteractiveCard>
              </Grid>

              {/* Gamification Demo */}
              <Grid item xs={12} md={6}>
                <InteractiveCard>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Gamificación: Registro
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    Completa el formulario y gana puntos para desbloquear
                    recompensas.
                  </Typography>
                  <Box
                    component="form"
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <TextField
                      label="Nombre"
                      value={registroFields.name}
                      onChange={(e) =>
                        handleRegistroChange("name", e.target.value)
                      }
                      variant="outlined"
                    />
                    <TextField
                      label="Email"
                      value={registroFields.email}
                      onChange={(e) =>
                        handleRegistroChange("email", e.target.value)
                      }
                      variant="outlined"
                    />
                    <TextField
                      label="Teléfono"
                      value={registroFields.phone}
                      onChange={(e) =>
                        handleRegistroChange("phone", e.target.value)
                      }
                      variant="outlined"
                    />
                  </Box>
                </InteractiveCard>
              </Grid>

              {/* Newsletter Subscription */}
              <Grid item xs={12} md={6}>
                <InteractiveCard>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Suscripción a Newsletters
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    Suscríbete y acumula puntos para personalizar tu
                    experiencia.
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={newsletterSubs.tech}
                          onChange={() => handleNewsletterChange("tech")}
                        />
                      }
                      label="Tecnología"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={newsletterSubs.marketing}
                          onChange={() => handleNewsletterChange("marketing")}
                        />
                      }
                      label="Marketing"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={newsletterSubs.design}
                          onChange={() => handleNewsletterChange("design")}
                        />
                      }
                      label="Diseño"
                    />
                  </Box>
                </InteractiveCard>
              </Grid>

              {/* Survey Demo */}
              <Grid item xs={12} md={6}>
                <InteractiveCard>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Encuesta Rápida
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    Responde preguntas y gana puntos + un cupón al completar.
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => handleEncuestaAnswer(1)}
                    >
                      Pregunta 1
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleEncuestaAnswer(2)}
                    >
                      Pregunta 2
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => handleEncuestaAnswer(3)}
                    >
                      Pregunta 3
                    </Button>
                    <ActionButton
                      variant="contained"
                      onClick={handleEncuestaComplete}
                      disabled={encuestaAnswers.length !== 3}
                    >
                      Completar Encuesta
                    </ActionButton>
                  </Box>
                </InteractiveCard>
              </Grid>

              {/* Check-in Demo */}
              <Grid item xs={12} md={6}>
                <InteractiveCard>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Check-in Diario
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    Registra tu actividad y gana 5 puntos al instante.
                  </Typography>
                  <ActionButton
                    variant="contained"
                    onClick={handleCheckin}
                    disabled={checkinDone}
                    startIcon={<Star />}
                  >
                    {checkinDone ? "Check-in Realizado" : "Hacer Check-in"}
                  </ActionButton>
                </InteractiveCard>
              </Grid>

              {/* ICP Demo */}
              <Grid item xs={12} md={6}>
                <InteractiveCard>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Perfil de Cliente Ideal
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    Define tu perfil y desbloquea puntos para personalizar tu
                    experiencia.
                  </Typography>
                  <Box
                    component="form"
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <TextField
                      label="Empresa"
                      value={icpFields.company}
                      onChange={(e) =>
                        handleIcpChange("company", e.target.value)
                      }
                      variant="outlined"
                    />
                    <TextField
                      label="Rol"
                      value={icpFields.role}
                      onChange={(e) => handleIcpChange("role", e.target.value)}
                      variant="outlined"
                    />
                    <TextField
                      label="Industria"
                      value={icpFields.industry}
                      onChange={(e) =>
                        handleIcpChange("industry", e.target.value)
                      }
                      variant="outlined"
                    />
                  </Box>
                </InteractiveCard>
              </Grid>

              {/* Tutorial Demo */}
              <Grid item xs={12} md={6}>
                <InteractiveCard>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Tutorial Interactivo
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    Completa lecciones y gana 3 puntos por cada una.
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {tutorialLessons.map((completed, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        onClick={() => handleLessonComplete(index)}
                        disabled={completed}
                      >
                        {completed
                          ? `Lección ${index + 1} Completada`
                          : `Completar Lección ${index + 1}`}
                      </Button>
                    ))}
                  </Box>
                </InteractiveCard>
              </Grid>

              {/* Coupon Generation Demo */}
              <Grid item xs={12}>
                <InteractiveCard sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      mb: 2,
                      color: theme.palette.primary.main,
                    }}
                  >
                    Genera un Cupón
                  </Typography>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    Crea un cupón de 5 créditos para usar en nuestra plataforma.
                  </Typography>
                  <ActionButton
                    variant="contained"
                    color="secondary"
                    onClick={handleGenerateCoupon}
                    startIcon={<Star />}
                  >
                    Generar Cupón
                  </ActionButton>
                </InteractiveCard>
              </Grid>
            </Grid>
          </Box>

          {/* Final CTA */}
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, mb: 3, color: theme.palette.text.primary }}
            >
              ¿Listo para Transformar tu Negocio?
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: "800px", mx: "auto" }}
            >
              Únete a miles de desarrolladores que ya están creando aplicaciones
              modernas con Neptuno. Prueba nuestras APIs, gestiona créditos y
              aumenta el engagement con gamificación. ¡Comienza gratis ahora!
            </Typography>
            <Link href="/user/auth/#register" passHref>
              <ActionButton
                variant="contained"
                color="secondary"
                size="large"
                endIcon={<RocketLaunch />}
              >
                Empieza Gratis
              </ActionButton>
            </Link>
          </Box>
        </Container>

        {/* Snackbar Notifications */}
        <AnimatePresence>
          {(snackbarOpen || message) && (
            <Snackbar
              open={snackbarOpen || !!message}
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
                  severity={
                    snackbarSeverity ||
                    (message?.includes("Error") ? "error" : "success")
                  }
                  sx={{
                    width: "100%",
                    borderRadius: "12px",
                    boxShadow: theme.shadows[6],
                  }}
                  iconMapping={{
                    success: <CheckCircle fontSize="inherit" />,
                    error: <Cancel fontSize="inherit" />,
                  }}
                >
                  {snackbarMessage || message}
                </Alert>
              </motion.div>
            </Snackbar>
          )}
        </AnimatePresence>
      </Box>
    </>
  );
}
