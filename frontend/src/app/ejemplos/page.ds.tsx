// src/app/ejemplos/page.tsx
"use client";

import { useAuth } from "@/lib/auth/context";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Alert, Box, Container, Typography, Divider, Chip, Grid } from "@mui/material";
import SurveyForm from "./SurveryForm";
import RegistrationForm from "./RegistrationForm";
import NewsletterForm from "./NewsletterForm";
import { Badge } from "@/lib/types";

export default function ExamplesPage() {
  const { gamification, credits } = useAuth();
  const [activeBadges, setActiveBadges] = useState<Badge[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Efecto para detectar nuevos badges
  useEffect(() => {
    if (gamification) {
      const newBadges = gamification.badges.filter(
        badge => !activeBadges.some(b => b.id === badge.id)
      );
      if (newBadges.length > 0) {
        setActiveBadges(prev => [...prev, ...newBadges]);
      }
    }
  }, [gamification?.badges]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Typography variant="h3" gutterBottom>
          Sistema de Gamificación
        </Typography>
        
        <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
          <Box display="flex" gap={2} alignItems="center" mb={2}>
            <Chip 
              label={`${credits} Créditos`} 
              color="primary" 
              variant="outlined"
            />
            <Chip
              label={`${gamification?.points || 0} Puntos`}
              color="secondary"
              variant="outlined"
            />
          </Box>
          
          {activeBadges.map(badge => (
            <motion.div
              key={badge.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Chip
                label={badge.name}
                color="success"
                sx={{ m: 0.5 }}
                onDelete={() => setActiveBadges(prev => prev.filter(b => b.id !== badge.id))}
              />
            </motion.div>
          ))}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <SurveyForm onError={setError} />
          </Grid>
        
        </Grid>

        <Grid item xs={12} md={6}>
            <RegistrationForm onError={setError} />
          </Grid>
          
          <Grid item xs={12}>
            <NewsletterForm onError={setError} />
          </Grid>
      </motion.div>
    </Container>
  );
}