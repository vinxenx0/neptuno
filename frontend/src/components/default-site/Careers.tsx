// src/components/default-site/Team.tsx
'use client';

import { motion } from 'framer-motion';

const teamMembers = [
  {
    name: 'Ana López',
    role: 'CEO',
    image: '/images/team/ana.jpg',
  },
  {
    name: 'Carlos Pérez',
    role: 'CTO',
    image: '/images/team/carlos.jpg',
  },
  {
    name: 'María García',
    role: 'CMO',
    image: '/images/team/maria.jpg',
  },
];

export default function Team() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-semibold mb-10 text-gray-900"
        >
          Nuestro Equipo
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-gray-50 p-6 rounded-xl shadow hover:shadow-md transition"
            >
              <img
                src={member.image}
                alt={member.name}
                className="w-24 h-24 mx-auto rounded-full mb-4"
              />
              <h3 className="text-xl font-bold mb-1 text-gray-800">{member.name}</h3>
              <p className="text-gray-600">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
