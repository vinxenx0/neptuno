
// src/components/default-site/Features.tsx
'use client';
import { motion } from 'framer-motion';
import { Icon } from '@mui/material';
import { Code, Rocket, Settings } from '@mui/icons-material';

const features = [
  {
    icon: <Rocket fontSize="large" />,
    title: "Implementación Rápida",
    description: "Lanza tu solución en días, no meses, con nuestra plataforma lista para usar."
  },
  {
    icon: <Settings fontSize="large" />,
    title: "Personalización Total",
    description: "Adapta cada aspecto a tus necesidades específicas sin complicaciones."
  },
  {
    icon: <Code fontSize="large" />,
    title: "Tecnología Avanzada",
    description: "Construido con las últimas tecnologías para garantizar rendimiento y seguridad."
  }
];

export default function Features() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Potencia tu negocio</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre cómo nuestra plataforma puede transformar tus operaciones y crecimiento.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-10">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gradient-to-b from-white to-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}