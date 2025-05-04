// frontend/src/app/(default-site)/about-us/page.tsx
// This is the About Us page component for a SaaS application.
// It provides information about the company, its mission, and values.
// frontend/src/app/(default-site)/about-us/page.tsx
'use client';

import { motion } from 'framer-motion';
import AboutUs from '@/components/default-site/AboutUs';
import Trust from '@/components/default-site/Trust';
import Teams from '@/components/default-site/Teams';
import Culture from '@/components/default-site/Culture';
import Careers from '@/components/default-site/Careers';

export default function AboutUsPage() {
  return (
    <>
      {/* Hero personalizado */}
      <section className="bg-white py-24 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold mb-4 text-gray-900"
        >
          Conoce quiénes somos
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-600 text-lg max-w-2xl mx-auto"
        >
          Impulsamos el crecimiento de negocios modernos con tecnología, pasión y propósito.
        </motion.p>
      </section>

      {/* Misión y Valores */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <motion.img
            src="/images/team-working.jpg"
            alt="Nuestro equipo"
            className="rounded-xl shadow-lg"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          />

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Nuestra misión</h2>
            <p className="text-gray-600 mb-6">
              Ofrecer soluciones SaaS modernas que empoderen a empresas de todos los tamaños para alcanzar su máximo potencial.
            </p>

            <h3 className="text-xl font-semibold mb-2 text-gray-800">Nuestros valores</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Innovación continua</li>
              <li>Compromiso con el cliente</li>
              <li>Transparencia y ética</li>
              <li>Trabajo en equipo</li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Componentes modulares */}
      <AboutUs />
      <Teams />
      <Culture />
      <Careers />
      <Trust />

      {/* Visión futura */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl font-semibold mb-4 text-gray-900"
          >
            Miramos hacia el futuro
          </motion.h2>
          <p className="text-gray-600 text-lg">
            Estamos construyendo herramientas no solo para hoy, sino para el mañana.
            El futuro de tu negocio comienza aquí.
          </p>
        </div>
      </section>
    </>
  );
}
