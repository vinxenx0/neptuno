// frontend/src/components/default-site/AboutUs.tsx
'use client';
import { motion } from 'framer-motion';
import { Button, Typography } from "@mui/material";
import { Info } from "@mui/icons-material";

export default function AboutUs() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-50 rounded-full">
            <Info className="text-blue-600" />
            <Typography variant="overline" className="text-blue-600 font-semibold">
              NUESTRA HISTORIA
            </Typography>
          </div>
          <Typography variant="h3" className="font-bold text-gray-900 mb-4">
            Innovación impulsada por valores
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600 max-w-3xl mx-auto">
            Conectando tecnología y negocio para crear soluciones transformadoras
          </Typography>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 opacity-20"></div>
              <img 
                src="/images/team-working.jpg" 
                alt="Team working" 
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <Typography variant="body1" className="text-gray-600 leading-relaxed">
              Somos un equipo apasionado por la tecnología, dedicado a ofrecer soluciones SaaS escalables y eficientes para empresas de todos los tamaños.
            </Typography>
            <Typography variant="body1" className="text-gray-600 leading-relaxed">
              Nuestra misión es empoderar negocios mediante software accesible, seguro y fácil de usar, combinando lo mejor de la innovación tecnológica con un profundo entendimiento de las necesidades empresariales.
            </Typography>
            <div className="flex flex-wrap gap-4 mt-8">
              <Button 
                variant="contained" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"
              >
                Conoce nuestro equipo
              </Button>
              <Button 
                variant="outlined" 
                className="border-gray-300 text-gray-700"
              >
                Nuestra metodología
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}