// frontend/src/components/default-site/Contact.tsx
'use client';
import { motion } from 'framer-motion';
import { 
  TextField, 
  Button, 
  Typography, 
  Box,
  Grid,
  Divider
} from "@mui/material";
import { 
  Email, 
  Phone, 
  LocationOn,
  Send
} from "@mui/icons-material";

export default function Contact() {
  return (
    <section className="py-24 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto">
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Typography variant="h3" className="font-bold text-gray-900 mb-4">
                Hablemos
              </Typography>
              <Typography variant="subtitle1" className="text-gray-600 mb-8">
                ¿Tienes preguntas o quieres saber más? Estamos aquí para ayudarte.
              </Typography>
              
              <div className="space-y-6">
                <Box className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <Email fontSize="medium" />
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="font-semibold">
                      Correo electrónico
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      info@empresa.com
                    </Typography>
                  </div>
                </Box>
                
                <Box className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <Phone fontSize="medium" />
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="font-semibold">
                      Teléfono
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      +34 123 456 789
                    </Typography>
                  </div>
                </Box>
                
                <Box className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <LocationOn fontSize="medium" />
                  </div>
                  <div>
                    <Typography variant="subtitle2" className="font-semibold">
                      Oficinas
                    </Typography>
                    <Typography variant="body2" className="text-gray-600">
                      Avenida Miguel Indurain, Murcia, 30008 España
                    </Typography>
                  </div>
                </Box>
              </div>
              
              <Divider className="my-8" />
              
              <Typography variant="h6" className="font-semibold mb-4">
                Síguenos
              </Typography>
              <div className="flex gap-3">
                {['Twitter', 'LinkedIn', 'Instagram'].map((social, i) => (
                  <Button 
                    key={i}
                    variant="outlined" 
                    className="border-gray-300 text-gray-700 hover:border-gray-400"
                    size="small"
                  >
                    {social}
                  </Button>
                ))}
              </div>
            </motion.div>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              <Typography variant="h5" className="font-bold mb-6">
                Envíanos un mensaje
              </Typography>
              
              <form className="space-y-4">
                <TextField
                  fullWidth
                  label="Nombre completo"
                  variant="outlined"
                  size="medium"
                />
                
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  variant="outlined"
                  size="medium"
                  type="email"
                />
                
                <TextField
                  fullWidth
                  label="Empresa"
                  variant="outlined"
                  size="medium"
                />
                
                <TextField
                  fullWidth
                  label="Mensaje"
                  variant="outlined"
                  size="medium"
                  multiline
                  rows={4}
                />
                
                <Button
                  variant="contained"
                  size="large"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg mt-4"
                  endIcon={<Send />}
                  fullWidth
                >
                  Enviar mensaje
                </Button>
              </form>
            </motion.div>
          </Grid>
        </Grid>
      </div>
    </section>
  );
}