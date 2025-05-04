
// src/components/default-site/EnhancedFeatures.tsx
'use client';
import { motion } from 'framer-motion';
import { Typography, Button } from "@mui/material";
import { IntegrationInstructions, Api, Language } from "@mui/icons-material";

export default function EnhancedFeatures() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <Typography variant="h3" className="font-bold text-gray-900">
            Plataforma Extensible y Modular
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600">
            Construye sobre una base sólida y amplía según tus necesidades
          </Typography>
          
          <div className="space-y-4">
            {[
              {
                icon: <IntegrationInstructions fontSize="large" />,
                title: "Integraciones",
                text: "Conecta con tus herramientas favoritas mediante API"
              },
              {
                icon: <Api fontSize="large" />,
                title: "Ecosistema API",
                text: "Sistema de API modular y documentación interactiva"
              },
              {
                icon: <Language fontSize="large" />,
                title: "Multilingüe",
                text: "Soporte para múltiples idiomas y regiones"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="text-blue-600">{feature.icon}</div>
                <div>
                  <Typography variant="h6" className="font-semibold">
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" className="text-gray-600">
                    {feature.text}
                  </Typography>
                </div>
              </motion.div>
            ))}
          </div>
          
          <Button
            variant="contained"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 mt-6"
          >
            Explorar Documentación
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-500 opacity-10 rounded-3xl"></div>
          <div className="relative bg-white p-1 rounded-2xl shadow-xl border border-gray-100">
            <img 
              src="/images/features-visual.png" 
              alt="Features" 
              className="rounded-xl w-full h-auto"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}