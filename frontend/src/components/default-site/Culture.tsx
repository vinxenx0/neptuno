// src/components/default-site/Culture.tsx
'use client';
import { motion } from 'framer-motion';
import { Typography, Avatar, Button } from "@mui/material";
import { Groups, Diversity3, WorkspacePremium } from "@mui/icons-material";

const values = [
  {
    icon: <Groups fontSize="large" />,
    title: "Colaboración",
    description: "Trabajo en equipo transdisciplinario con comunicación abierta"
  },
  {
    icon: <Diversity3 fontSize="large" />,
    title: "Diversidad",
    description: "Equipo global con múltiples perspectivas y enfoques"
  },
  {
    icon: <WorkspacePremium fontSize="large" />,
    title: "Excelencia",
    description: "Compromiso con los más altos estándares de calidad"
  }
];

export default function Culture() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Typography variant="h3" className="font-bold text-gray-900 mb-4">
            Nuestra Cultura Corporativa
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600 max-w-3xl mx-auto">
            Los pilares fundamentales que guían cada una de nuestras acciones
          </Typography>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-b from-white to-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 h-full">
                <Avatar className="w-16 h-16 mb-6 bg-blue-50 text-blue-600">
                  {value.icon}
                </Avatar>
                <Typography variant="h5" className="font-bold mb-3">
                  {value.title}
                </Typography>
                <Typography variant="body1" className="text-gray-600">
                  {value.description}
                </Typography>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-16 text-center"
        >
          <Button
            variant="outlined"
            className="border-gray-300 text-gray-700 hover:border-gray-400"
          >
            Conoce nuestro manifiesto cultural
          </Button>
        </motion.div>
      </div>
    </section>
  );
}