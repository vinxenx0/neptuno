// frontend/src/components/default-site/Pricing.tsx
'use client';
import { motion } from 'framer-motion';
import { Card, CardContent, Typography, Button, Box, Grid, Divider } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

const plans = [
  {
    name: "Starter",
    price: "Gratis",
    description: "Perfecto para comenzar",
    features: ["1 usuario", "3 proyectos", "Soporte básico", "Acceso a funciones básicas"],
    highlight: false,
    buttonText: "Comenzar ahora",
  },
  {
    name: "Profesional",
    price: "$29",
    period: "/mes",
    description: "Para equipos en crecimiento",
    features: ["5 usuarios", "Proyectos ilimitados", "Soporte prioritario", "API completa"],
    highlight: true,
    buttonText: "Prueba gratuita",
  },
  {
    name: "Empresa",
    price: "Personalizado",
    description: "Para organizaciones",
    features: ["Usuarios ilimitados", "Soporte 24/7", "Integraciones avanzadas", "SLAs personalizados"],
    highlight: false,
    buttonText: "Contactar ventas",
  },
];

export default function Pricing() {
  return (
    <Box className="py-24 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Typography variant="h3" component="h2" className="font-bold text-gray-900 mb-4">
            Planes transparentes
          </Typography>
          <Typography variant="subtitle1" className="text-xl text-gray-600 max-w-3xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades. Sin sorpresas.
          </Typography>
        </motion.div>

        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan) => (
            <Grid item xs={12} md={4} key={plan.name}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Card 
                  className={`h-full transition-all ${plan.highlight ? "border-2 border-blue-500 shadow-lg" : "border border-gray-200"}`}
                  sx={{ borderRadius: 3 }}
                >
                  <CardContent className="p-8">
                    {plan.highlight && (
                      <div className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full inline-block mb-4">
                        POPULAR
                      </div>
                    )}
                    
                    <Typography variant="h5" component="div" className="font-bold mb-2">
                      {plan.name}
                    </Typography>
                    
                    <div className="flex items-baseline mb-4">
                      <Typography variant="h3" className="font-bold">
                        {plan.price}
                      </Typography>
                      {plan.period && (
                        <Typography variant="body2" color="text.secondary" className="ml-1">
                          {plan.period}
                        </Typography>
                      )}
                    </div>
                    
                    <Typography variant="body2" color="text.secondary" className="mb-6">
                      {plan.description}
                    </Typography>
                    
                    <Divider className="my-4" />
                    
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle className="text-green-500 mr-2 mt-0.5" fontSize="small" />
                          <Typography variant="body2">{f}</Typography>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      variant={plan.highlight ? "contained" : "outlined"} 
                      fullWidth
                      size="large"
                      className={plan.highlight ? "bg-gradient-to-r from-blue-600 to-indigo-600" : ""}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </div>
    </Box>
  );
}