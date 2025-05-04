// frontend/src/app/(marketplace)/marketplace/order/[id]/OrderSuccessClient.tsx
// frontend/src/app/(marketplace)/marketplace/order/[id]/OrderSuccessClient.tsx
"use client";

import { Order, OrderItem } from "@/lib/types";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Avatar,
  useTheme
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Download,
  ArrowBack,
  ShoppingBag,
  CalendarToday,
  Inventory
} from "@mui/icons-material";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const successVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

export default function OrderSuccessClient({ order }: { order: Order }) {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
      py: 6,
      px: { xs: 2, sm: 4 },
    }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        viewport={{ once: true }}
      >
        <Card sx={{
          maxWidth: "1000px",
          mx: "auto",
          borderRadius: 3,
          boxShadow: "0 10px 30px rgba(0, 0, 100, 0.1)",
          overflow: "hidden",
        }}>
          {/* Header Section */}
          <Box sx={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            color: "white",
            p: 3,
            textAlign: "center"
          }}>
            <motion.div variants={successVariants}>
              <CheckCircle sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                ¡Compra Exitosa!
              </Typography>
              <Typography variant="subtitle1">
                Gracias por tu pedido. Aquí están los detalles de tu compra.
              </Typography>
            </motion.div>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={4}>
              {/* Order Summary Column */}
              <Grid item xs={12} md={5}>
                <motion.div variants={itemVariants}>
                  <Paper elevation={0} sx={{
                    p: 3,
                    borderRadius: 2,
                    height: '100%',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <ShoppingBag sx={{ mr: 1 }} />
                      Resumen del Pedido
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ mb: 2.5 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Número de Orden
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          #{order.id}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2.5 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Fecha
                        </Typography>
                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday sx={{ fontSize: 16, mr: 1 }} />
                          {new Date(order.created_at).toLocaleString()}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2.5 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Estado
                        </Typography>
                        <Chip
                          label={order.status}
                          color={getStatusColor(order.status)}
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                          {order.total_amount} créditos
                        </Typography>
                      </Box>
                    </Box>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={() => window.location.href = "/marketplace"}
                        fullWidth
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          borderWidth: 2,
                          '&:hover': { borderWidth: 2 }
                        }}
                      >
                        Volver al Marketplace
                      </Button>
                    </motion.div>
                  </Paper>
                </motion.div>
              </Grid>

              {/* Order Items Column */}
              <Grid item xs={12} md={7}>
                <motion.div variants={itemVariants}>
                  <Paper elevation={0} sx={{
                    p: 3,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
                    border: '1px solid rgba(0, 0, 0, 0.05)'
                  }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <Inventory sx={{ mr: 1 }} />
                      Detalles del Pedido
                    </Typography>

                    <List sx={{ '& .MuiListItem-root': { px: 0 } }}>
                      <AnimatePresence>
                        {order.items.map((item: OrderItem, index: number) => (
                          <motion.div
                            key={item.id}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            variants={itemVariants}
                            exit="hidden"
                            layout
                          >
                            <ListItem sx={{
                              py: 2,
                              borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' }
                            }}>
                              <Avatar sx={{
                                width: 56,
                                height: 56,
                                mr: 2,
                                borderRadius: 2,
                                bgcolor: 'primary.light',
                                color: 'primary.dark'
                              }}>
                                <ShoppingBag />
                              </Avatar>
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle1" fontWeight={500}>
                                    {item.product_name}
                                  </Typography>
                                }
                                secondary={
                                  <>
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ display: 'block' }}
                                    >
                                      Cantidad: {item.quantity}
                                    </Typography>
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Precio: {item.price} créditos
                                    </Typography>
                                  </>
                                }
                                sx={{ mr: 2 }}
                              />
                              {item.is_digital && item.file_path ? (
                                <motion.div whileHover={{ scale: 1.05 }}>
                                  <Button
                                    href={item.file_path}
                                    download
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Download />}
                                    sx={{
                                      borderRadius: 2,
                                      fontWeight: 600,
                                      boxShadow: '0 2px 4px rgba(79, 70, 229, 0.2)',
                                      '&:hover': {
                                        boxShadow: '0 4px 8px rgba(79, 70, 229, 0.3)'
                                      }
                                    }}
                                  >
                                    Descargar
                                  </Button>
                                </motion.div>
                              ) : (
                                <Typography variant="body2" color="text.secondary">
                                  Producto físico
                                </Typography>
                              )}
                            </ListItem>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </List>
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}