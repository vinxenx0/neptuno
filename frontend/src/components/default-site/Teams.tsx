// src/components/default-site/Teams.tsx
'use client';
import { motion } from 'framer-motion';
import { Typography, Button, Avatar } from "@mui/material";
import { LinkedIn, Twitter } from "@mui/icons-material";

const teamMembers = [
  {
    name: 'Ana López',
    role: 'CEO & Fundadora',
    image: '/images/team/ana.jpg',
    bio: 'Más de 15 años de experiencia en tecnología y liderazgo empresarial.',
    social: {
      linkedin: '#',
      twitter: '#'
    }
  },
  {
    name: 'Carlos Pérez',
    role: 'CTO',
    image: '/images/team/carlos.jpg',
    bio: 'Especialista en arquitectura de software y sistemas escalables.',
    social: {
      linkedin: '#',
      twitter: '#'
    }
  },
  {
    name: 'María García',
    role: 'CMO',
    image: '/images/team/maria.jpg',
    bio: 'Experta en estrategias de crecimiento y posicionamiento de marca.',
    social: {
      linkedin: '#',
      twitter: '#'
    }
  },
];

export default function Team() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Typography variant="h3" className="font-bold text-gray-900 mb-4">
            Conoce a nuestro equipo
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600 max-w-2xl mx-auto">
            Profesionales apasionados que hacen posible nuestra visión compartida
          </Typography>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-gradient-to-br from-white to-gray-50 p-8 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 h-full flex flex-col">
                <div className="relative mb-6">
                  <Avatar 
                    src={member.image} 
                    alt={member.name}
                    className="w-32 h-32 mx-auto border-4 border-white shadow-lg"
                    sx={{ width: 128, height: 128 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="contained" 
                      size="small" 
                      className="min-w-0 p-2 bg-blue-600"
                      href={member.social.linkedin}
                    >
                      <LinkedIn fontSize="small" />
                    </Button>
                    <Button 
                      variant="contained" 
                      size="small" 
                      className="min-w-0 p-2 bg-blue-400"
                      href={member.social.twitter}
                    >
                      <Twitter fontSize="small" />
                    </Button>
                  </div>
                </div>
                
                <Typography variant="h5" className="font-bold text-center mb-1">
                  {member.name}
                </Typography>
                <Typography variant="subtitle2" color="primary" className="text-center mb-4">
                  {member.role}
                </Typography>
                <Typography variant="body2" className="text-gray-600 text-center mb-6 flex-grow">
                  {member.bio}
                </Typography>
                
                <Button 
                  variant="outlined" 
                  size="small" 
                  className="mt-auto mx-auto border-gray-300 text-gray-700 hover:border-gray-400"
                >
                  Ver perfil completo
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button 
            variant="contained" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"
            size="large"
          >
            Únete a nuestro equipo
          </Button>
        </motion.div>
      </div>
    </section>
  );
}