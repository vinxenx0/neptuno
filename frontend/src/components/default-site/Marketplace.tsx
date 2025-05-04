

// src/components/default-site/Marketplace.tsx
'use client';
import { motion } from 'framer-motion';
import { Typography, Button, Chip } from "@mui/material";
import { IntegrationInstructions, Bolt, Security } from "@mui/icons-material";

const integrations = [
  {
    name: 'Slack',
    category: 'Comunicación',
    icon: '/images/integrations/slack.svg'
  },
  {
    name: 'Zapier',
    category: 'Automatización',
    icon: '/images/integrations/zapier.svg'
  },
  {
    name: 'Google Analytics',
    category: 'Analítica',
    icon: '/images/integrations/ga.svg'
  }
];

export default function Marketplace() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Typography variant="h3" className="font-bold text-gray-900 mb-4">
            Ecosistema de Integraciones
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600 max-w-2xl mx-auto">
            Amplía las capacidades de tu plataforma con nuestras integraciones certificadas
          </Typography>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {integrations.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100"
            >
              <div className="absolute top-4 right-4">
                <Chip label={item.category} size="small" className="bg-blue-50 text-blue-600" />
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 mb-6 bg-gray-50 rounded-xl flex items-center justify-center p-4">
                  <img src={item.icon} alt={item.name} className="w-full h-auto" />
                </div>
                <Typography variant="h5" className="font-bold mb-2">
                  {item.name}
                </Typography>
                <Button
                  variant="outlined"
                  className="mt-4 border-gray-300 text-gray-700 hover:border-gray-400"
                  endIcon={<Bolt />}
                >
                  Conectar
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-12 text-center"
        >
          <Button
            variant="contained"
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            startIcon={<IntegrationInstructions />}
          >
            Explorar todas las integraciones
          </Button>
        </motion.div>
      </div>
    </section>
  );
}