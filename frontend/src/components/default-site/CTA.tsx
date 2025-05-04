// frontend/src/components/default-site/CTA.tsx
'use client';
import { motion } from 'framer-motion';
import { Button, Typography } from "@mui/material";
import { RocketLaunch } from "@mui/icons-material";

export default function CTA() {
  return (
    <section className="py-32 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto text-center relative z-10"
      >
        <Typography variant="h2" className="text-white font-bold mb-6">
          Transforma tu negocio hoy mismo
        </Typography>
        <Typography variant="h5" className="text-blue-100 mb-8">
          Únete a más de 5,000 empresas que ya están escalando con nuestra plataforma
        </Typography>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="contained"
            size="large"
            className="bg-white text-blue-600 hover:bg-gray-100 shadow-xl transform hover:scale-105 transition-all"
            startIcon={<RocketLaunch />}
          >
            Comenzar prueba gratis
          </Button>
          <Button
            variant="outlined"
            size="large"
            className="text-white border-white hover:bg-white/10"
          >
            Ver demostración
          </Button>
        </div>
        
        <motion.div
          initial={{ scale: 0.8 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
          className="mt-12 flex justify-center gap-6 opacity-80"
        >
          {['TrustBadge1', 'TrustBadge2', 'TrustBadge3'].map((badge, i) => (
            <img 
              key={i}
              src={`/images/${badge}.png`}
              alt="Trust badge"
              className="h-12 w-auto grayscale contrast-200"
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}