// frontend/src/components/default-site/Blog.tsx
'use client';
import { motion } from 'framer-motion';
import Link from "next/link";
import { CalendarMonth, ArrowOutward } from "@mui/icons-material";

export default function Blog() {
  const posts = [
    {
      title: 'Cómo lanzar tu SaaS en 2024',
      summary: 'Guía paso a paso para lanzar tu plataforma SaaS con éxito.',
      date: 'Abril 10, 2024',
      category: 'Estrategia',
      readTime: '5 min'
    },
    {
      title: 'Tendencias tecnológicas en SaaS',
      summary: 'Descubre las últimas herramientas y tecnologías en el ecosistema SaaS.',
      date: 'Marzo 28, 2024',
      category: 'Tecnología',
      readTime: '8 min'
    },
  ];

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Link href="/blog" className="group">
            <motion.h2
              whileHover={{ scale: 1.02 }}
              className="text-4xl font-bold text-gray-900 mb-4 inline-block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Últimos Artículos
              <ArrowOutward className="ml-2 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </motion.h2>
          </Link>
          <p className="text-gray-600 max-w-xl mx-auto">
            Insights valiosos sobre tecnología, negocios y estrategias SaaS
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {posts.map((post, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-gray-100"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <CalendarMonth fontSize="small" />
                <span>{post.date}</span>
                <span className="mx-2">•</span>
                <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-full text-xs">
                  {post.category}
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h3>
              <p className="text-gray-600 mb-6">{post.summary}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{post.readTime} lectura</span>
                <Link
                  href={`/blog/${post.title.toLowerCase().replace(/ /g, '-')}`}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Leer más
                  <ArrowOutward className="text-current" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}