"use client";

import { useAuth } from "@/lib/auth/context";
import { motion } from "framer-motion";
import { Card, Typography, LinearProgress, Box, ButtonGroup, Button } from "@mui/material";
import { useState } from "react";
import fetchAPI from "@/lib/api";

// SurveyForm.tsx
export default function SurveyForm({ onError }: { onError: (msg: string) => void }) {
    const { gamification } = useAuth();
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [progress, setProgress] = useState(0);
  
    const questions = [
      { id: 'q1', text: "¿Cómo descubriste nuestra plataforma?", eventId: 1 },
      { id: 'q2', text: "¿Qué funcionalidad valoras más?", eventId: 2 },
      { id: 'q3', text: "¿Recomendarías nuestro servicio?", eventId: 3 },
    ];
  
    const handleAnswer = async (questionId: string, answer: string, eventId: number) => {
      try {
        // Enviar evento de gamificación
        const response = await fetchAPI<GamificationEventResponse>(
          "/v1/gamification/events",
          {
            method: "POST",
            data: { event_type_id: eventId },
          }
        );
  
        if (response.error) throw new Error(typeof response.error === "string" ? response.error : "Unexpected error");
  
        // Actualizar estado local
        setAnswers(prev => {
          const newAnswers = { ...prev, [questionId]: answer };
          const newProgress = (Object.keys(newAnswers).length / questions.length) * 100;
          setProgress(newProgress);
          
          // Verificar si se completó
          if (Object.keys(newAnswers).length === questions.length) {
            awardBadge(4); // ID del badge para encuestas completas
          }
          
          return newAnswers;
        });
  
      } catch (err) {
        onError(err instanceof Error ? err.message : "Error al registrar respuesta");
      }
    };
  
    const awardBadge = async (badgeId: number) => {
      try {
        // Endpoint hipotético para asignar badges
        const response = await fetchAPI(
          `/v1/gamification/badges/${badgeId}/award`,
          { method: "POST" }
        );
        
        if (response.error) throw new Error(response.error);
        
      } catch (err) {
        onError("Error al otorgar insignia");
      }
    };
  
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Encuesta Interactiva
        </Typography>
        
        <LinearProgress 
          variant="determinate" 
          value={progress} 
          sx={{ mb: 3, height: 8, borderRadius: 4 }}
        />
        
        {questions.map((q) => (
          <Box key={q.id} sx={{ mb: 2 }}>
            <Typography variant="body1" gutterBottom>
              {q.text}
            </Typography>
            
            <ButtonGroup fullWidth>
              {['Sí', 'No', 'Quizás'].map((option) => (
                <Button
                  key={option}
                  variant={answers[q.id] === option ? "contained" : "outlined"}
                  onClick={() => handleAnswer(q.id, option, q.eventId)}
                  disabled={!!answers[q.id]}
                >
                  {option}
                </Button>
              ))}
            </ButtonGroup>
          </Box>
        ))}
      </Card>
    );
  }