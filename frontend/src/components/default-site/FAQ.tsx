//frontend/src/components/default-site/FAQ.tsx
'use client';
import { motion } from 'framer-motion';
import { Typography, Accordion, AccordionSummary, AccordionDetails, Button } from "@mui/material";
import { ExpandMore, Help } from "@mui/icons-material";

const faqs = [
  {
    question: '¿Qué incluye la prueba gratuita?',
    answer: 'Acceso completo a todas las funciones por 14 días.'
  },
  {
    question: '¿Cómo manejan la seguridad?',
    answer: 'Certificaciones SOC 2 y encriptación de extremo a extremo.'
  },
  {
    question: '¿Soporte 24/7?',
    answer: 'Soporte premium disponible en todos los planes pagos.'
  }
];

export default function FAQ() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-50 rounded-full">
            <Help className="text-blue-600" />
            <Typography variant="overline" className="text-blue-600 font-semibold">
              PREGUNTAS FRECUENTES
            </Typography>
          </div>
          <Typography variant="h3" className="font-bold text-gray-900 mb-4">
            Encuentra respuestas rápidas
          </Typography>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Accordion className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  className="hover:bg-gray-50"
                >
                  <Typography variant="h6" className="font-semibold">
                    {faq.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body1" className="text-gray-600">
                    {faq.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-12 text-center"
        >
          <Button
            variant="outlined"
            className="border-gray-300 text-gray-700 hover:border-gray-400"
          >
            Ver todas las preguntas
          </Button>
        </motion.div>
      </div>
    </section>
  );
}