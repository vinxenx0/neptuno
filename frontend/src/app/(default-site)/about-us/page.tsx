// frontend/src/app/about-us/page.tsx
"use client";

import { Typography, Container, Grid, Box, Paper } from "@mui/material";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
  return (
    <Container maxWidth="lg" className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Typography variant="h3" component="h1" gutterBottom>
          Sobre Nosotros
        </Typography>
        <Typography variant="body1" paragraph>
          Somos una empresa apasionada por crear soluciones tecnológicas de alto impacto.
          Nuestro objetivo es transformar ideas en productos reales que mejoren la vida
          de las personas y potencien el crecimiento de los negocios.
        </Typography>
      </motion.div>

      <Grid container spacing={4} className="mt-8">
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Image
              src="/images/team-working.jpg"
              alt="Equipo trabajando"
              width={600}
              height={400}
              style={{ borderRadius: '1rem' }}
            />
          </motion.div>
        </Grid>
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Paper elevation={3} className="p-6 rounded-2xl shadow-md">
              <Typography variant="h5" gutterBottom>
                Nuestra Misión
              </Typography>
              <Typography variant="body2" paragraph>
                Ofrecer soluciones digitales innovadoras que impulsen el éxito de nuestros clientes
                a través de tecnologías modernas, diseño intuitivo y experiencia de usuario de calidad.
              </Typography>

              <Typography variant="h5" gutterBottom>
                Nuestros Valores
              </Typography>
              <Typography variant="body2">
                Compromiso, innovación, transparencia y trabajo en equipo.
              </Typography>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
}
