
// src/components/default-site/Products.tsx
'use client';
import { motion } from 'framer-motion';
import { Typography, Button, Chip } from "@mui/material";
import { Dashboard, Analytics, Settings } from "@mui/icons-material";

const products = [
  {
    name: 'Dashboard Inteligente',
    icon: <Dashboard fontSize="large" />,
    category: 'Analítica'
  },
  {
    name: 'CRM Integrado',
    icon: <Analytics fontSize="large" />,
    category: 'Gestión'
  },
  {
    name: 'Motor de Reglas',
    icon: <Settings fontSize="large" />,
    category: 'Automatización'
  }
];

export default function Products() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Typography variant="h3" className="font-bold text-gray-900 mb-4">
            Suite de Productos Integrados
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600 max-w-2xl mx-auto">
            Soluciones modulares que se adaptan a tus necesidades específicas
          </Typography>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              <div className="w-16 h-16 mb-6 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                {product.icon}
              </div>
              <Chip label={product.category} className="mb-4 bg-gray-100" />
              <Typography variant="h5" className="font-bold mb-3">
                {product.name}
              </Typography>
              <Typography variant="body1" className="text-gray-600 mb-6">
                Descripción detallada del producto y sus capacidades principales.
              </Typography>
              <Button
                variant="outlined"
                className="border-gray-300 text-gray-700 hover:border-gray-400"
              >
                Explorar características
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}