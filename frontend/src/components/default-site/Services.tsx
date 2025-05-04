
// src/components/default-site/Services.tsx
'use client';
import { motion } from 'framer-motion';
import { Typography, Button, Avatar } from "@mui/material";
import { RocketLaunch, SupportAgent, Terminal } from "@mui/icons-material";

const services = [
  {
    title: 'Implementación Expertas',
    icon: <RocketLaunch fontSize="large" />,
    description: 'Onboarding completo con consultores especializados'
  },
  {
    title: 'Soporte Premium',
    icon: <SupportAgent fontSize="large" />,
    description: 'Asistencia técnica prioritaria 24/7'
  },
  {
    title: 'Desarrollo Personalizado',
    icon: <Terminal fontSize="large" />,
    description: 'Soluciones a medida para necesidades específicas'
  }
];

export default function Services() {
  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Typography variant="h3" className="font-bold text-gray-900 mb-4">
            Servicios Profesionales
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600 max-w-2xl mx-auto">
            Más que una plataforma - un partner tecnológico completo
          </Typography>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              <Avatar className="w-16 h-16 mb-6 bg-blue-50 text-blue-600">
                {service.icon}
              </Avatar>
              <Typography variant="h5" className="font-bold mb-3">
                {service.title}
              </Typography>
              <Typography variant="body1" className="text-gray-600 mb-6">
                {service.description}
              </Typography>
              <Button
                variant="text"
                className="text-blue-600 hover:bg-blue-50"
                endIcon={<span>→</span>}
              >
                Saber más
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}