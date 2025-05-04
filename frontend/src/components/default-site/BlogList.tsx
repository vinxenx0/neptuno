// frontend/src/components/default-site/BlogList.tsx
'use client';
import { motion } from 'framer-motion';
import Link from "next/link";
import { CalendarMonth, ArrowOutward } from "@mui/icons-material";

const posts = [
  {
    slug: 'primer-post',
    title: 'Guía Completa de Implementación SaaS',
    excerpt: 'Aprende las mejores prácticas para desplegar tu solución en la nube',
    date: 'Marzo 15, 2024',
    category: 'Tecnología'
  },
  {
    slug: 'actualizacion-abril',
    title: 'Nuevas Características de la Plataforma',
    excerpt: 'Descubre las últimas actualizaciones y mejoras de rendimiento',
    date: 'Abril 2, 2024',
    category: 'Actualizaciones'
  },
];

export default function BlogList() {
  return (
    <section className="py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900 mb-8 text-center"
        >
          Artículos Recientes
        </motion.h1>
        
        <div className="grid gap-8">
          {posts.map((post, idx) => (
            <motion.article
              key={post.slug}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100"
            >
              <Link href={`/blog/${post.slug}`} className="group">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm">
                        {post.category}
                      </span>
                      <span className="text-gray-500 text-sm flex items-center gap-1">
                        <CalendarMonth fontSize="small" />
                        {post.date}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  </div>
                  <div className="md:w-48 flex-shrink-0">
                    <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-50" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}