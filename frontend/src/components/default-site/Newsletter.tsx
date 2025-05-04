// frontend/src/components/default-site/Newsletter.tsx
'use client';
import { motion } from 'framer-motion';
import { TextField, Button, Typography } from "@mui/material";
import { Email, Send } from "@mui/icons-material";

export default function Newsletter() {
  return (
    <section className="py-24 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white rounded-full shadow-sm">
            <Email className="text-blue-600" />
            <Typography variant="overline" className="text-blue-600 font-semibold">
              SUSCRIPCIÓN
            </Typography>
          </div>
          
          <Typography variant="h3" className="font-bold text-gray-900 mb-4">
            Insights y Actualizaciones
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600 mb-8 max-w-xl mx-auto">
            Recibe contenido exclusivo, actualizaciones de producto y recursos estratégicos
          </Typography>
          
          <motion.div
            initial={{ scale: 0.95 }}
            whileInView={{ scale: 1 }}
            className="flex flex-col md:flex-row gap-4 items-center justify-center"
          >
            <TextField
              variant="outlined"
              placeholder="Ingresa tu email"
              className="bg-white rounded-lg w-full md:w-96"
              InputProps={{
                startAdornment: <Email className="text-gray-400 mr-2" />
              }}
            />
            <Button
              variant="contained"
              size="large"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"
              endIcon={<Send />}
            >
              Suscribirse
            </Button>
          </motion.div>
          
          <Typography variant="caption" className="block mt-4 text-gray-500">
            Respetamos tu privacidad. Nunca compartiremos tu información.
          </Typography>
        </motion.div>
      </div>
    </section>
  );
}