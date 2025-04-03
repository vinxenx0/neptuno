"use client";

import { useState } from "react";
import { Box, Typography, Button, TextField, Checkbox, FormControlLabel } from "@mui/material";
import fetchAPI from "@/lib/api";
import { useAuth } from "@/lib/auth/context";

export default function Ejemplos() {
  const { setGamification } = useAuth();
  const [surveyAnswers, setSurveyAnswers] = useState<number[]>([]);
  const [formFields, setFormFields] = useState({ name: "", email: "", phone: "" });
  const [subscriptions, setSubscriptions] = useState({ list1: false, list2: false, list3: false });

  const updateGamification = async () => {
    const { data } = await fetchAPI<UserInfo>("/info");
    if (data?.gamification) {
      const totalPoints = data.gamification.reduce((sum, g) => sum + g.points, 0);
      const badges = data.gamification.map(g => g.badge).filter(b => b !== null) as Badge[];
      setGamification({ points: totalPoints, badges });
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

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Ejemplos</Typography>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Encuesta</Typography>
        <Button onClick={() => handleSurveyAnswer(1)}>Pregunta 1</Button>
        <Button onClick={() => handleSurveyAnswer(2)}>Pregunta 2</Button>
        <Button onClick={() => handleSurveyAnswer(3)}>Pregunta 3</Button>
        <Button onClick={handleSurveyComplete} disabled={surveyAnswers.length !== 3}>Completar</Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Formulario de Registro</Typography>
        <TextField label="Nombre" onChange={(e) => handleFormChange("name", e.target.value)} />
        <TextField label="Email" onChange={(e) => handleFormChange("email", e.target.value)} />
        <TextField label="Teléfono" onChange={(e) => handleFormChange("phone", e.target.value)} />
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6">Suscripciones</Typography>
        <FormControlLabel
          control={<Checkbox checked={subscriptions.list1} onChange={() => handleSubscriptionChange("list1")} />}
          label="Lista 1"
        />
        <FormControlLabel
          control={<Checkbox checked={subscriptions.list2} onChange={() => handleSubscriptionChange("list2")} />}
          label="Lista 2"
        />
        <FormControlLabel
          control={<Checkbox checked={subscriptions.list3} onChange={() => handleSubscriptionChange("list3")} />}
          label="Lista 3"
        />
      </Box>
    </Box>
  );
}