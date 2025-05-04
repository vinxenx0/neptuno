
// frontend/src/components/default-site/LegalLayout.tsx
'use client';
import { motion } from 'framer-motion';

interface LegalLayoutProps {
  title: string;
  content: string;
}

export default function LegalLayout({ title, content }: LegalLayoutProps) {
  return (
    <div className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {title}
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="prose-lg text-gray-700 max-w-3xl mx-auto"
        >
          {content.split('\n').map((paragraph, idx) => (
            <motion.p
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="mb-6 leading-relaxed"
            >
              {paragraph}
            </motion.p>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-16 border-t border-gray-100 pt-8"
        >
          <p className="text-gray-500 text-sm">
            Última actualización: {new Date().toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </motion.div>
      </div>
    </div>
  );
}