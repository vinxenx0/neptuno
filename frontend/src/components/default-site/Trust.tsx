// frontend/src/components/default-site/Trust.tsx
'use client';
import { motion } from 'framer-motion';
import { Typography } from "@mui/material";

const companies = [
  '/images/logos/company1.svg',
  '/images/logos/company2.svg',
  '/images/logos/company3.svg',
  '/images/logos/company4.svg'
];

export default function Trust() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center mb-12"
        >
          <Typography variant="subtitle1" className="text-gray-500 mb-4">
            Confiado por equipos en más de 20 países
          </Typography>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-12">
          {companies.map((logo, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 0.6 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ opacity: 1 }}
              className="grayscale hover:grayscale-0 transition-all"
            >
              <img 
                src={logo} 
                alt="Trusted company" 
                className="h-12 w-auto object-contain"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}