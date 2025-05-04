// src/components/default-site/Hero.tsx
'use client';
import { motion } from 'framer-motion';
import { Button } from "@mui/material";

export default function Hero() {
  return (
    <section className="px-6 py-32 text-center bg-gradient-to-b from-blue-50 to-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight"
        >
          Transforma tu negocio con <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">nuestra plataforma SaaS</span> 🚀
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed"
        >
          La solución todo-en-uno para automatizar, gestionar y escalar tu negocio con tecnología de vanguardia.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Button 
            variant="contained" 
            size="large"
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          >
            Comenzar prueba gratuita
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm"
          >
            Ver demostración
          </Button>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-16"
        >
          <div className="relative bg-white p-1 rounded-xl shadow-xl inline-block">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-400 opacity-30 blur-sm"></div>
            <img 
              src="/images/dashboard-preview.png" 
              alt="Dashboard preview" 
              className="relative rounded-lg w-full max-w-4xl border border-gray-100"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}