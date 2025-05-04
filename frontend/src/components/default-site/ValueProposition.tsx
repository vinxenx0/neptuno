
// src/components/default-site/ValueProposition.tsx
'use client';
import { motion } from 'framer-motion';
import { Typography, Button } from "@mui/material";
import { Star, Bolt, Security } from "@mui/icons-material";

export default function ValueProposition() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Star className="text-blue-600" />
            </div>
            <Typography variant="overline" className="text-blue-600 font-semibold">
              POR QUÉ ELEGIRNOS
            </Typography>
          </div>
          
          <Typography variant="h2" className="font-bold text-gray-900 mb-6">
            La plataforma SaaS más completa del mercado
          </Typography>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: <Bolt />, title: "Implementación rápida", text: "Funcional en 48h" },
              { icon: <Security />, title: "Seguridad líder", text: "Certificación ISO 27001" },
              { icon: <span>🚀</span>, title: "Escalabilidad", text: "Crece sin límites" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="text-blue-600 text-3xl mb-4">{item.icon}</div>
                <Typography variant="h6" className="font-bold mb-2">
                  {item.title}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  {item.text}
                </Typography>
              </motion.div>
            ))}
          </div>
          
          <Button
            variant="contained"
            size="large"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"
          >
            Comparar planes
          </Button>
        </motion.div>
      </div>
    </section>
  );
}