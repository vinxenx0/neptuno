// frontend/src/app/ejemplos/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Button, TextField, Checkbox, FormControlLabel, Card, CardContent, Snackbar, Alert, Grid } from "@mui/material";
import { motion } from "framer-motion";
import fetchAPI from "@/lib/api";
import { useAuth } from "@/lib/auth/context";
import { UserGamificationResponse, Badge, InfoResponse } from "@/lib/types";

export default function Ejemplos() {
  const { setGamification } = useAuth();
  const [snackMessage, setSnackMessage] = useState<string | null>(null);
  const [registroFields, setRegistroFields] = useState({ name: "", email: "", phone: "" });
  const [newsletterSubs, setNewsletterSubs] = useState({ tech: false, marketing: false, design: false });
  const [encuestaAnswers, setEncuestaAnswers] = useState<number[]>([]);
  const [checkinDone, setCheckinDone] = useState(false);
  const [icpFields, setIcpFields] = useState({ company: "", role: "", industry: "" });
  const [tutorialLessons, setTutorialLessons] = useState([false, false, false]);
  // Nuevos estados para corregir los errores
  const [formFields, setFormFields] = useState({ name: "", email: "", phone: "" });
  const [subscriptions, setSubscriptions] = useState({ list1: false, list2: false, list3: false });
  const [surveyAnswers, setSurveyAnswers] = useState<number[]>([]);

  // Resto del código...

  // Actualizar gamificación al cargar la página y después de cada acción relevante
  const updateGamification = async () => {
    const { data } = await fetchAPI<InfoResponse>("/info");
    if (data?.gamification) {
      const totalPoints = data.gamification.reduce((sum, g) => sum + g.points, 0);
      const badges = data.gamification.map(g => g.badge).filter(b => b !== null) as Badge[];
      setGamification({ points: totalPoints, badges });
    }
  };
  // Ejecutar updateGamification al montar el componente
  useEffect(() => {
    updateGamification();
  }, []);

  const handleRegistroChange = async (field: keyof typeof registroFields, value: string) => {
    setRegistroFields(prev => ({ ...prev, [field]: value }));
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
    setNewsletterSubs(prev => ({ ...prev, [newsletter]: !prev[newsletter] }));
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
    setEncuestaAnswers(prev => [...prev, answer]);
    await fetchAPI("/v1/gamification/events", { method: "POST", data: { event_type_id: 5 } });
    updateGamification();
    setSnackMessage("¡Ganaste 1 punto por responder una pregunta!");
  };

  const handleEncuestaComplete = async () => {
    if (encuestaAnswers.length === 3) {
      await fetchAPI("/v1/gamification/events", { method: "POST", data: { event_type_id: 6 } });
      updateGamification();
      setSnackMessage("¡Completaste la encuesta y ganaste 10 puntos!");
    }
  };

  const handleCheckin = async () => {
    setCheckinDone(true);
    await fetchAPI("/v1/gamification/events", { method: "POST", data: { event_type_id: 7 } });
    updateGamification();
    setSnackMessage("¡Ganaste 5 puntos por hacer check-in!");
  };

  const handleIcpChange = async (field: keyof typeof icpFields, value: string) => {
    setIcpFields(prev => ({ ...prev, [field]: value }));
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
    setFormFields(prev => ({ ...prev, [field]: value }));
    if (value) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 3 } // registration_field
      });
      updateGamification();
    }
    if (formFields.name && formFields.email && formFields.phone) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 4 } // registration_completed
      });
      updateGamification();
    }
  };

  const handleSubscriptionChange = async (list: keyof typeof subscriptions) => {
    setSubscriptions(prev => ({ ...prev, [list]: !prev[list] }));
    if (!subscriptions[list]) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 5 } // subscription_list
      });
      updateGamification();
    }
    if (subscriptions.list1 && subscriptions.list2 && subscriptions.list3) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 6 } // all_subscriptions
      });
      updateGamification();
    }
  };

  const handleSurveyAnswer = async (answer: number) => {
    setSurveyAnswers(prev => [...prev, answer]);
    await fetchAPI("/v1/gamification/events", {
      method: "POST",
      data: { event_type_id: 1 } // survey_question
    });
    updateGamification();
  };

  const handleSurveyComplete = async () => {
    if (surveyAnswers.length === 3) {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: 2 } // survey_completed
      });
      updateGamification();
    }
  };

  const handleLessonComplete = async (index: number) => {
    setTutorialLessons(prev => {
      const newLessons = [...prev];
      newLessons[index] = true;
      return newLessons;
    });
    await fetchAPI("/v1/gamification/events", { method: "POST", data: { event_type_id: 10 } });
    updateGamification();
    setSnackMessage("¡Ganaste 3 puntos por completar una lección!");
  };

  return (
    <Box sx={{ p: 4, bgcolor: "#f5f7fa", minHeight: "100vh" }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Typography variant="h3" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Ejemplos de Gamificación
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" sx={{ mb: 4 }}>
          Descubre cómo puedes ganar puntos y badges interactuando con nuestra plataforma.
        </Typography>
      </motion.div>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" color="primary">Formulario de Registro</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Regístrate completando tus datos y gana puntos por cada campo. ¡Completa todo para un bonus!
                </Typography>
                <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField label="Nombre" value={registroFields.name} onChange={(e) => handleRegistroChange("name", e.target.value)} variant="outlined" />
                  <TextField label="Email" value={registroFields.email} onChange={(e) => handleRegistroChange("email", e.target.value)} variant="outlined" />
                  <TextField label="Teléfono" value={registroFields.phone} onChange={(e) => handleRegistroChange("phone", e.target.value)} variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" color="primary">Suscripción a Newsletters</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Suscríbete a nuestras newsletters y gana puntos por cada una. ¡Todas te dan un badge especial!
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
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" color="primary">Encuesta de Satisfacción</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Responde preguntas y gana puntos por cada una. ¡Completa la encuesta para más recompensas!
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Button variant="outlined" onClick={() => handleEncuestaAnswer(1)}>Pregunta 1</Button>
                  <Button variant="outlined" onClick={() => handleEncuestaAnswer(2)}>Pregunta 2</Button>
                  <Button variant="outlined" onClick={() => handleEncuestaAnswer(3)}>Pregunta 3</Button>
                  <Button variant="contained" onClick={handleEncuestaComplete} disabled={encuestaAnswers.length !== 3}>Completar</Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" color="primary">Check-in Horario</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Registra tu entrada o salida y gana puntos por mantener tu horario.
                </Typography>
                <Button variant="contained" onClick={handleCheckin} disabled={checkinDone}>
                  {checkinDone ? "Check-in Realizado" : "Hacer Check-in"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" color="primary">Perfil de Cliente Ideal (ICP)</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Amplía tus datos personales y gana puntos por cada campo. ¡Completa todo para un bonus!
                </Typography>
                <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField label="Empresa" value={icpFields.company} onChange={(e) => handleIcpChange("company", e.target.value)} variant="outlined" />
                  <TextField label="Rol" value={icpFields.role} onChange={(e) => handleIcpChange("role", e.target.value)} variant="outlined" />
                  <TextField label="Industria" value={icpFields.industry} onChange={(e) => handleIcpChange("industry", e.target.value)} variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" color="primary">Tutorial Interactivo</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Completa lecciones y gana puntos por cada una que termines.
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {tutorialLessons.map((completed, index) => (
                    <Button key={index} variant="outlined" onClick={() => handleLessonComplete(index)} disabled={completed}>
                      {completed ? `Lección ${index + 1} Completada` : `Completar Lección ${index + 1}`}
                    </Button>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <Snackbar open={!!snackMessage} autoHideDuration={3000} onClose={() => setSnackMessage(null)}>
        <Alert severity="success" onClose={() => setSnackMessage(null)}>{snackMessage}</Alert>
      </Snackbar>
    </Box>
  );
}