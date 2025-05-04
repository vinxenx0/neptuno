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
  alpha,
  useMediaQuery,
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

// Animaciones
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
};

// Componentes estilizados
const HeroSection = styled(motion.section)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.info.dark} 100%)`,
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius * 4,
  padding: theme.spacing(8),
  margin: theme.spacing(6, 0),
  overflow: 'hidden',
  position: 'relative',
  boxShadow: theme.shadows[10],
  '&:after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
    zIndex: 1,
  },
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius * 3,
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

const FeatureCard = styled(motion(Card))(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
  padding: theme.spacing(4),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[8],
  },
}));

const ActionButton = styled(motion(Button))(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(2, 4),
  fontWeight: 700,
  fontSize: '1.1rem',
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.common.white,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const InteractiveCard = styled(motion(Card))(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(4),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[6],
  },
}));

export default function SplashPage() {
  const { user, credits, setCredits, setGamification, coupons, setCoupons } =
    useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      
      <Box sx={{
        minHeight: '100vh',
        background: `linear-gradient(150deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
        pb: 12,
      }}>
        <Container maxWidth="lg">
          {/* Sección Hero */}
          <HeroSection
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <Box position="relative" zIndex={2}>
              <motion.div variants={fadeInUp}>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    fontSize: isMobile ? '2.5rem' : '4rem',
                    lineHeight: 1.2,
                    background: `linear-gradient(45deg, ${theme.palette.common.white} 30%, ${alpha(theme.palette.secondary.light, 0.8)} 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Neptuno: Tu SaaS para<br />
                  <Box component="span" sx={{ display: 'inline-block', mt: 1 }}>
                    APIs y Gamificación
                  </Box>
                </Typography>
              </motion.div>

              <motion.div variants={fadeInUp}>
                <Typography variant="h6" sx={{
                  mb: 5,
                  maxWidth: '800px',
                  mx: 'auto',
                  opacity: 0.9,
                  fontWeight: 300,
                  color: alpha(theme.palette.common.white, 0.9)
                }}>
                  Crea aplicaciones modernas con nuestras APIs robustas, gestiona créditos fácilmente y aumenta el engagement con gamificación integrada.
                </Typography>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                style={{ display: 'flex', gap: theme.spacing(3), justifyContent: 'center', flexWrap: 'wrap' }}
              >
                {user ? (
                  <Link href="/user/dashboard" passHref>
                    <ActionButton
                      endIcon={<ArrowForward />}
                      whileHover={{ scale: 1.05 }}
                    >
                      Ir al Dashboard
                    </ActionButton>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/register" passHref>
                      <ActionButton whileHover={{ scale: 1.05 }}>
                        Comienza Gratis
                      </ActionButton>
                    </Link>
                    <Link href="/auth/login" passHref>
                      <ActionButton
                        variant="outlined"
                        sx={{
                          background: alpha(theme.palette.common.white, 0.1),
                          '&:hover': {
                            background: alpha(theme.palette.common.white, 0.2),
                          }
                        }}
                        whileHover={{ scale: 1.05 }}
                      >
                        Iniciar Sesión
                      </ActionButton>
                    </Link>
                  </>
                )}
              </motion.div>
            </Box>
          </HeroSection>

          {/* Sección de características */}
          <Box sx={{ mb: 12, textAlign: 'center' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Typography variant="h3" sx={{
                fontWeight: 700,
                mb: 6,
                fontSize: isMobile ? '2rem' : '3rem'
              }}>
                Todo lo que Necesitas para Escalar
              </Typography>
            </motion.div>

            <Grid container spacing={4}>
              {[
                { icon: <CreditScore />, title: 'Gestión de Créditos', color: 'primary' },
                { icon: <Api />, title: 'APIs de Alto Rendimiento', color: 'info' },
                { icon: <Security />, title: 'Escalabilidad Segura', color: 'success' }
              ].map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <FeatureCard
                    variants={fadeInUp}
                    transition={{ delay: index * 0.1 }}
                  >
                    <motion.div whileHover={{ scale: 1.1 }}>
                      <Avatar sx={{
                        bgcolor: alpha(theme.palette[feature.color].light, 0.1),
                        width: 80,
                        height: 80,
                        mb: 3,
                        color: theme.palette[feature.color].main,
                      }}>
                        {feature.icon}
                      </Avatar>
                    </motion.div>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.title === 'Gestión de Créditos' 
                        ? 'Controla tus créditos con facilidad y prueba nuestras APIs con 10 créditos gratis al registrarte.'
                        : feature.title === 'APIs de Alto Rendimiento'
                        ? 'Integra endpoints rápidos y personalizables para potenciar tus aplicaciones.'
                        : 'Crece sin límites con un framework seguro diseñado para tu éxito.'}
                    </Typography>
                  </FeatureCard>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Sección interactiva */}
          <Box sx={{ mb: 12 }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Typography variant="h3" sx={{
                fontWeight: 700,
                mb: 6,
                fontSize: isMobile ? '2rem' : '3rem'
              }}>
                Prueba Neptuno en Acción
              </Typography>
            </motion.div>

            <Grid container spacing={4}>
              {/* Demostración de créditos */}
              <Grid item xs={12} md={6}>
                <InteractiveCard
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                      Sistema de Créditos
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                      Experimenta nuestro sistema de créditos: realiza una acción y consume un crédito en tiempo real.
                    </Typography>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <ActionButton
                        onClick={handleTestCreditConsumption}
                        startIcon={<Bolt />}
                      >
                        Consumir 1 Crédito
                      </ActionButton>
                    </motion.div>
                    <Typography variant="h6" sx={{ mt: 3, color: theme.palette.primary.main }}>
                      {user ? credits : localCredits} créditos disponibles
                    </Typography>
                  </Box>
                </InteractiveCard>
              </Grid>

              {/* Marketplace */}
              <Grid item xs={12} md={6}>
                <InteractiveCard
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                      Prueba el Marketplace
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                      Añade un producto de ejemplo a tu carrito y prueba el proceso de checkout.
                    </Typography>
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <ActionButton
                        onClick={handleAddToCart}
                        startIcon={<ShoppingCart />}
                      >
                        Añadir al Carrito
                      </ActionButton>
                    </motion.div>
                  </Box>
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

   {/* CTA Final */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography variant="h3" sx={{
                fontWeight: 700,
                mb: 3,
                fontSize: isMobile ? '2rem' : '3rem'
              }}>
                ¿Listo para Transformar tu Negocio?
              </Typography>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Link href="/auth/register" passHref>
                  <ActionButton
                    endIcon={<RocketLaunch />}
                    sx={{ fontSize: isMobile ? '1rem' : '1.1rem' }}
                  >
                    Empieza Gratis
                  </ActionButton>
                </Link>
              </motion.div>
            </Box>
          </motion.div>
        </Container>

        {/* Notificaciones */}
        <AnimatePresence>
          {(snackbarOpen || message) && (
            <Snackbar
              open={snackbarOpen || !!message}
              autoHideDuration={6000}
              onClose={handleSnackbarClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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
                    borderRadius: '12px',
                    boxShadow: theme.shadows[6],
                    alignItems: 'center',
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
