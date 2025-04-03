"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  CircularProgress,
} from '@mui/material';
import { CheckCircleOutline } from '@mui/icons-material';
import fetchAPI from "@/lib/api";
import { useAuth } from "@/lib/auth/context";
import { motion } from "framer-motion";

const fieldConfig = [
  { 
    id: 'email',
    label: 'Correo Electrónico',
    type: 'email',
    eventId: 10,
    validate: (value) => /^\S+@\S+\.\S+$/.test(value)
  },
  {
    id: 'username',
    label: 'Nombre de Usuario',
    type: 'text',
    eventId: 11,
    validate: (value) => value.length >= 3
  },
  {
    id: 'password',
    label: 'Contraseña',
    type: 'password',
    eventId: 12,
    validate: (value) => value.length >= 8
  }
];

export default function RegistrationForm({ onError }) {

  const [values, setValues] = useState({});
  const [trackedFields, setTrackedFields] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleFieldInteraction = useCallback(async (field, value) => {
    if (field.validate(value) && !trackedFields.has(field.id)) {
      try {
        await fetchAPI("/v1/gamification/events", {
          method: "POST",
          data: { event_type_id: field.eventId }
        });
        
        setTrackedFields(prev => new Set([...prev, field.id]));
      } catch (err) {
        onError(`Error al registrar ${field.label}: ${err.message}`);
      }
    }
  }, [trackedFields, fetchAPI, onError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Lógica de registro real iría aquí
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (trackedFields.size === fieldConfig.length) {
        await fetchAPI("/v1/gamification/events", {
          method: "POST",
          data: { event_type_id: 13 } // ID para badge de registro completo
        });
      }
      
      setCompleted(true);
    } catch (err) {
      onError("Error en el proceso de registro");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card sx={{ p: 3, position: 'relative' }}>
      <Typography variant="h5" gutterBottom>
        Registro Progresivo
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {fieldConfig.map((field) => (
            <Grid item xs={12} key={field.id}>
              <motion.div layout>
                <TextField
                  fullWidth
                  label={field.label}
                  type={field.type}
                  onBlur={(e) => handleFieldInteraction(field, e.target.value)}
                  onChange={(e) => setValues(prev => ({
                    ...prev,
                    [field.id]: e.target.value
                  }))}
                  InputProps={{
                    endAdornment: trackedFields.has(field.id) && (
                      <CheckCircleOutline color="success" />
                    )
                  }}
                />
              </motion.div>
            </Grid>
          ))}
          
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              disabled={isSubmitting || completed}
              sx={{ height: 48 }}
            >
              {completed ? (
                <CheckCircleOutline />
              ) : isSubmitting ? (
                <CircularProgress size={24} />
              ) : (
                "Completar Registro"
              )}
            </Button>
          </Grid>
        </Grid>
      </form>
      
      {completed && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center"
        >
          <Typography variant="h6" color="white">
            ¡Registro Completo!
          </Typography>
        </motion.div>
      )}
    </Card>
  );
}