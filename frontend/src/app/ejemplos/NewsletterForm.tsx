"use client";

import {  LinearProgress, Box, ButtonGroup } from "@mui/material";
import fetchAPI from "@/lib/api";
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  Skeleton
} from '@mui/material';
import { useAuth } from "@/lib/auth/context";
import { motion, AnimatePresence } from "framer-motion";

const mockNewsletters = [
  { 
    id: 1, 
    name: "Tecnología Avanzada", 
    eventId: 20,
    description: "Lo último en IA y blockchain",
    icon: "🤖"
  },
  {
    id: 2,
    name: "Marketing Digital",
    eventId: 21,
    description: "Estrategias de crecimiento",
    icon: "📈"
  },
  {
    id: 3,
    name: "Desarrollo Web",
    eventId: 22,
    description: "Frameworks modernos",
    icon: "💻"
  }
];

export default function NewsletterForm({ onError }) {

  const [subscriptions, setSubscriptions] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [simulatedAI, setSimulatedAI] = useState(false);

  useEffect(() => {
    // Simular carga inicial con IA
    setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setSimulatedAI(true), 500);
    }, 1200);
  }, []);

  const handleSubscription = async (id, eventId) => {
    try {
      await fetchAPI("/v1/gamification/events", {
        method: "POST",
        data: { event_type_id: eventId }
      });

      setSubscriptions(prev => {
        const newSubs = new Set([...prev, id]);
        if (newSubs.size === mockNewsletters.length) {
          fetchAPI("/v1/gamification/events", {
            method: "POST",
            data: { event_type_id: 23 } // Badge completo
          });
        }
        return newSubs;
      });

    } catch (err) {
      onError(`Error en suscripción: ${err.message}`);
    }
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Suscripciones Inteligentes
      </Typography>
      
      <Grid container spacing={2}>
        {mockNewsletters.map((nl) => (
          <Grid item xs={12} md={4} key={nl.id}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                {isLoading ? (
                  <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto' }} />
                ) : (
                  <motion.div
                    animate={{ rotate: simulatedAI ? [0, 15, -15, 0] : 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Avatar sx={{ 
                      bgcolor: subscriptions.has(nl.id) ? 'success.light' : 'grey.300',
                      mx: 'auto',
                      mb: 2
                    }}>
                      {nl.icon}
                    </Avatar>
                  </motion.div>
                )}
                
                {isLoading ? (
                  <>
                    <Skeleton width="60%" sx={{ mx: 'auto' }} />
                    <Skeleton width="80%" sx={{ mx: 'auto' }} />
                  </>
                ) : (
                  <>
                    <Typography variant="h6" gutterBottom>
                      {nl.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {nl.description}
                    </Typography>
                  </>
                )}
                
                <Box sx={{ mt: 2 }}>
                  {isLoading ? (
                    <Skeleton variant="rounded" height={36} />
                  ) : (
                    <Button
                      variant={subscriptions.has(nl.id) ? "contained" : "outlined"}
                      color="primary"
                      fullWidth
                      onClick={() => handleSubscription(nl.id, nl.eventId)}
                      disabled={subscriptions.has(nl.id)}
                    >
                      {subscriptions.has(nl.id) ? "Suscrito" : "Suscribirse"}
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <AnimatePresence>
        {simulatedAI && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3 bg-blue-50 rounded-lg"
          >
            <Typography variant="body2" color="text.secondary">
              🔍 Nuestra IA detectó que te pueden interesar estas categorías...
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}