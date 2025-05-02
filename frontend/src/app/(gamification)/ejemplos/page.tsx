// frontend/src/app/ejemplos/page.tsx
// Página de ejemplos interactivos de gamificación y cupones

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import fetchAPI from "@/lib/api";
import { useAuth } from "@/lib/auth/context";
import { UserGamificationResponse, Badge, InfoResponse, Coupon } from "@/lib/types";
import { Session } from "inspector/promises";

export default function Ejemplos() {
  const { setGamification, user, coupons, setCoupons } = useAuth();
  const [snackMessage, setSnackMessage] = useState<string | null>(null);
  const [registroFields, setRegistroFields] = useState({ name: "", email: "", phone: "" });
  const [newsletterSubs, setNewsletterSubs] = useState({ tech: false, marketing: false, design: false });
  const [encuestaAnswers, setEncuestaAnswers] = useState<number[]>([]);
  const [checkinDone, setCheckinDone] = useState(false);
  const [icpFields, setIcpFields] = useState({ company: "", role: "", industry: "" });
  const [tutorialLessons, setTutorialLessons] = useState([false, false, false]);
  const [formFields, setFormFields] = useState({ name: "", email: "", phone: "" });
  const [subscriptions, setSubscriptions] = useState({ list1: false, list2: false, list3: false });
  const [surveyAnswers, setSurveyAnswers] = useState<number[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const updateGamification = useCallback(async () => {
    const { data } = await fetchAPI<InfoResponse>("/whoami");
    if (data?.gamification) {
      const totalPoints = data.gamification.reduce((sum, g) => sum + g.points, 0);
      const badges = data.gamification.map((g) => g.badge).filter((b) => b !== null) as Badge[];
      setGamification({ points: totalPoints, badges });
    }
  }, [setGamification]);

  useEffect(() => {
    updateGamification();
  }, [updateGamification]);

  const handleGenerateCoupon = async () => {
    try {
      const { data } = await fetchAPI<Coupon>("/v1/coupons/generate-demo-coupon?credits=5", {
        method: "POST",
      });
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

  const handleRegistroChange = async (field: keyof typeof registroFields, value: string) => {
    setRegistroFields((prev) => ({ ...prev, [field]: value }));
    if (value) {
      await fetchAPI("/v1/gamification/events", { method: "POST", data: { event_type_id: 1 } });
      updateGamification();
      setSnackMessage("¡Ganaste 1 punto por completar un campo!");
    }
    if (registroFields.name && registroFields.email && registroFields.phone) {
      await fetchAPI("/v1/gamification/events", { method: "POST", data: { event_type_id: 2 } });
      updateGamification();
      setSnackMessage("¡Completaste el registro y ganaste 10 puntos!");
    }
  };

  const handleNewsletterChange = async (newsletter: keyof typeof newsletterSubs) => {
    setNewsletterSubs((prev) => ({ ...prev, [newsletter]: !prev[newsletter] }));
    if (!newsletterSubs[newsletter]) {
      await fetchAPI("/v1/gamification/events", { method: "POST", data: { event_type_id: 3 } });
      updateGamification();
      setSnackMessage("¡Ganaste 2 puntos por suscribirte a una newsletter!");
    }
    if (newsletterSubs.tech && newsletterSubs.marketing && newsletterSubs.design) {
      await fetchAPI("/v1/gamification/events", { method: "POST", data: { event_type_id: 4 } });
      updateGamification();
      setSnackMessage("¡Te suscribiste a todas las newsletters y ganaste 15 puntos!");
    }
  };

  const handleEncuestaAnswer = async (answer: number) => {
    setEncuestaAnswers((prev) => [...prev, answer]);
    await fetchAPI("/v1/gamification/events", { method: "POST", data: { event_type_id: 5 } });
    updateGamification();
    setSnackMessage("¡Ganaste 1 punto por responder una pregunta!");
  };

  // src/app/ejemplos/page.tsx (actualizar handleEncuestaComplete)
  const handleEncuestaComplete = async () => {
    if (encuestaAnswers.length === 3) {
      try {
        await fetchAPI("/v1/gamification/events", {
          method: "POST",
          data: { event_type_id: 6 },
        });
        updateGamification();

        // Generar cupón como recompensa
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
          setSnackMessage("¡Completaste la encuesta y ganaste 10 puntos + un cupón de 10 créditos!");
        } else {
          setSnackMessage("¡Completaste la encuesta y ganaste 10 puntos!");
        }
      } catch (err) {
        setSnackMessage("Error al procesar la encuesta");
        console.error(err);
      }
    }
  };

  const handleCheckin = async () => {
    setCheckinDone(true);
    await fetchAPI("/v1/gamification/events", { method: "POST", data: { event_type_id: 7 } });
    updateGamification();
    setSnackMessage("¡Ganaste 5 puntos por hacer check-in!");
  };

  const handleIcpChange = async (field: keyof typeof icpFields, value: string) => {
    setIcpFields((prev) => ({ ...prev, [field]: value }));
    if (value) {
      await fetchAPI("/v1/gamification/events", { method: "POST", data: { event_type_id: 8 } });
      updateGamification();
      setSnackMessage("¡Ganaste 1 punto por completar un campo del ICP!");
    }
    if (icpFields.company && icpFields.role && icpFields.industry) {
      await fetchAPI("/v1/gamification/events", { method: "POST", data: { event_type_id: 9 } });
      updateGamification();
      setSnackMessage("¡Completaste tu ICP y ganaste 10 puntos!");
    }
  };



  const handleFormChange = async (field: keyof typeof formFields, value: string) => {
    setFormFields((prev) => ({ ...prev, [field]: value }));
    if (value) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 3 },
      });
      updateGamification();
    }
    if (formFields.name && formFields.email && formFields.phone) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 4 },
      });
      updateGamification();
    }
  };

  const handleSubscriptionChange = async (list: keyof typeof subscriptions) => {
    setSubscriptions((prev) => ({ ...prev, [list]: !prev[list] }));
    if (!subscriptions[list]) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 5 },
      });
      updateGamification();
    }
    if (subscriptions.list1 && subscriptions.list2 && subscriptions.list3) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 6 },
      });
      updateGamification();
    }
  };

  const handleSurveyAnswer = async (answer: number) => {
    setSurveyAnswers((prev) => ({ ...prev, answer }));
    await fetchAPI("/v1/gamification/events", {
      method: "POST",
      data: { event_type_id: 1 },
    });
    updateGamification();
  };

  const handleSurveyComplete = async () => {
    if (surveyAnswers.length === 3) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 2 },
      });
      updateGamification();
    }
  };

  const handleLessonComplete = async (index: number) => {
    setTutorialLessons((prev) => {
      const newLessons = [...prev];
      newLessons[index] = true;
      return newLessons;
    });
    await fetchAPI("/v1/gamification/events", { method: "POST", data: { event_type_id: 10 } });
    updateGamification();
    setSnackMessage("¡Ganaste 3 puntos por completar una lección!");
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2" }}>
          ¡Transforma tu Negocio con Gamificación!
        </Typography>
        <Typography variant="h6" align="center" color="textSecondary" sx={{ mb: 4, maxWidth: "800px", mx: "auto" }}>
          Aumenta el engagement, dispara tus conversiones y fideliza a tus clientes con nuestra API SaaS de gamificación y scoring. ¡Prueba cómo funciona y descubre el poder de las recompensas hoy mismo!
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 6 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ borderRadius: 2, px: 4, py: 1.5 }}
            onClick={() => document.getElementById("registro")?.scrollIntoView({ behavior: "smooth" })}
          >
            ¡Prueba Gratis Ahora!
          </Button>
        </Box>
      </motion.div>

      {/* Main Content */}
      <Box sx={{ maxWidth: "800px", mx: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }} id="registro">
          <CardContent>
            <Typography variant="h6" color="primary">
              Regístrate y Gana Recompensas Instantáneas
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Completa tus datos y empieza a acumular puntos que potencian tu experiencia. ¡Tu primer paso hacia un engagement imparable!
            </Typography>
            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Nombre"
                value={registroFields.name}
                onChange={(e) => handleRegistroChange("name", e.target.value)}
                variant="outlined"
              />
              <TextField
                label="Email"
                value={registroFields.email}
                onChange={(e) => handleRegistroChange("email", e.target.value)}
                variant="outlined"
              />
              <TextField
                label="Teléfono"
                value={registroFields.phone}
                onChange={(e) => handleRegistroChange("phone", e.target.value)}
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              Suscríbete y Desbloquea Estrategias Ganadoras
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Únete a nuestras newsletters y recibe contenido exclusivo para maximizar tus conversiones mientras ganas puntos.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <FormControlLabel
                control={<Checkbox checked={newsletterSubs.tech} onChange={() => handleNewsletterChange("tech")} />}
                label="Tecnología"
              />
              <FormControlLabel
                control={<Checkbox checked={newsletterSubs.marketing} onChange={() => handleNewsletterChange("marketing")} />}
                label="Marketing"
              />
              <FormControlLabel
                control={<Checkbox checked={newsletterSubs.design} onChange={() => handleNewsletterChange("design")} />}
                label="Diseño"
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              Comparte tu Opinión y Sube de Nivel
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Responde preguntas y acumula puntos que destacan tu perfil en nuestra plataforma. ¡Tu feedback cuenta!
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button variant="outlined" onClick={() => handleEncuestaAnswer(1)}>
                Pregunta 1
              </Button>
              <Button variant="outlined" onClick={() => handleEncuestaAnswer(2)}>
                Pregunta 2
              </Button>
              <Button variant="outlined" onClick={() => handleEncuestaAnswer(3)}>
                Pregunta 3
              </Button>
              <Button
                variant="contained"
                onClick={handleEncuestaComplete}
                disabled={encuestaAnswers.length !== 3}
              >
                Completar Encuesta
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              Haz Check-in y Destaca
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Registra tu actividad y gana puntos para posicionarte como líder en tu industria.
            </Typography>
            <Button variant="contained" onClick={handleCheckin} disabled={checkinDone}>
              {checkinDone ? "Check-in Realizado" : "Hacer Check-in"}
            </Button>
          </CardContent>
        </Card>

        <Box sx={{ p: 4, background: "#1a1a2e", color: "white" }}>
          <Typography variant="h4">Página de Ejemplos</Typography>
          <Button variant="contained" onClick={handleGenerateCoupon} sx={{ mt: 2 }}>
            Generar Cupón de 5 Créditos
          </Button>
          <Snackbar
            open={!!message}
            autoHideDuration={3000}
            onClose={() => setMessage(null)}
          >
            <Alert severity={message?.includes("Error") ? "error" : "success"}>
              {message}
            </Alert>
          </Snackbar>
        </Box>

        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              Define tu Perfil y Maximiza Resultados
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Completa tu ICP y desbloquea puntos para personalizar tu experiencia y crecer con nuestra API.
            </Typography>
            <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Empresa"
                value={icpFields.company}
                onChange={(e) => handleIcpChange("company", e.target.value)}
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
                onChange={(e) => handleIcpChange("industry", e.target.value)}
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" color="primary">
              Aprende, Gana y Lidera
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Completa lecciones rápidas, domina nuestra plataforma y acumula puntos para destacar.
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {tutorialLessons.map((completed, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => handleLessonComplete(index)}
                  disabled={completed}
                >
                  {completed ? `Lección ${index + 1} Completada` : `Completar Lección ${index + 1}`}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* CTA Final */}
      <Box sx={{ mt: 6, textAlign: "center" }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", color: "#1976d2" }}>
          ¿Listo para revolucionar tu engagement?
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3, maxWidth: "600px", mx: "auto" }}>
          Únete a cientos de negocios que ya están aumentando sus conversiones con nuestra solución de gamificación. ¡Empieza gratis hoy!
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          sx={{ borderRadius: 2, px: 4, py: 1.5 }}
          onClick={() => window.location.href = "/signup"} // Ajusta la URL según tu flujo
        >
          Comienza Gratis
        </Button>
      </Box>

      <Snackbar open={!!snackMessage} autoHideDuration={3000} onClose={() => setSnackMessage(null)}>
        <Alert severity="success" onClose={() => setSnackMessage(null)}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}