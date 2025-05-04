// frontend/src/app/checkout/page.tsx
// frontend/src/app/checkout/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import fetchAPI from "@/lib/api";
import { CartItem, Order, PaymentMethod } from "@/lib/types";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Alert,
  Snackbar,
  Divider,
  CircularProgress,
  IconButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  Card,
  CardContent,
  Grid,
  Link,
  Paper,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Delete,
  Payment,
  CreditCard,
  AccountBalanceWallet,
  ArrowForward,
  ShoppingCartCheckout,
  Lock,
  LocalAtm,
} from "@mui/icons-material";

// Animation variants
const cardVariants = {
  offscreen: {
    y: 50,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

export default function CheckoutPage() {
  const { user, credits } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"credits" | number>("credits");

  useEffect(() => {
    const fetchData = async () => {
      const { data: cartData } = await fetchAPI<CartItem[]>("/v1/marketplace/cart");
      setCartItems(cartData || []);
      const totalAmount = cartData?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;
      setTotal(totalAmount);

      if (user) {
        const { data: methodsData } = await fetchAPI<PaymentMethod[]>("/v1/payments/methods");
        setPaymentMethods(methodsData || []);
      }
    };
    fetchData();
  }, [user]);

  const handleRemoveFromCart = async (cartItemId: number) => {
    try {
      await fetchAPI(`/v1/marketplace/cart/${cartItemId}`, { method: "DELETE" });
      const updatedCart = cartItems.filter((item) => item.id !== cartItemId);
      setCartItems(updatedCart);
      setTotal(updatedCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0));
    } catch (error) {
      alert("Error al eliminar el artículo del carrito");
    }
  };

  const handleCheckout = async () => {
    const hasPaidItems = cartItems.some((item) => !item.product.is_free);
    if (hasPaidItems && !user) {
      router.push("/auth/login");
      return;
    }
    setLoading(true);
    try {
      const order = {
        items: cartItems.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
        payment_method: selectedPaymentMethod === "credits" ? "credits" : selectedPaymentMethod,
      };
      const { data } = await fetchAPI<Order>("/v1/marketplace/orders", { method: "POST", data: order });
      if (data) {
        setSuccessMessage("¡Compra realizada con éxito!");
        setCartItems([]);
        router.push(`/marketplace/order/${data.id}`);
      }
    } catch (error) {
      alert("Error al procesar la compra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
        py: 6,
        px: { xs: 2, sm: 4 },
      }}
    >
      <motion.div
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.2 }}
        variants={cardVariants}
      >
        <Card
          sx={{
            maxWidth: "1200px",
            mx: "auto",
            borderRadius: 3,
            boxShadow: "0 10px 30px rgba(0, 0, 100, 0.1)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              color: "white",
              p: 3,
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              <ShoppingCartCheckout sx={{ verticalAlign: "middle", mr: 1 }} />
              Finalizar Compra
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            {cartItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Typography variant="h6" sx={{ textAlign: "center", py: 4 }}>
                  Tu carrito está vacío
                </Typography>
              </motion.div>
            ) : (
              <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                      Resumen del Pedido
                    </Typography>
                    <List sx={{ mb: 2 }}>
                      <AnimatePresence>
                        {cartItems.map((item, index) => (
                          <motion.div
                            key={item.id}
                            custom={index}
                            initial="hidden"
                            animate="visible"
                            variants={itemVariants}
                            layout
                          >
                            <ListItem
                              sx={{
                                py: 2,
                                px: 0,
                                borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.02)" },
                              }}
                              secondaryAction={
                                <IconButton
                                  onClick={() => handleRemoveFromCart(item.id)}
                                  sx={{
                                    color: "error.main",
                                    "&:hover": { backgroundColor: "rgba(255, 0, 0, 0.08)" },
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              }
                            >
                              <ListItemText
                                primary={
                                  <Typography variant="subtitle1" fontWeight={500}>
                                    {item.product.name}
                                  </Typography>
                                }
                                secondary={
                                  <>
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ display: "block" }}
                                    >
                                      Cantidad: {item.quantity}
                                    </Typography>
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Precio unitario: {item.product.price} créditos
                                    </Typography>
                                  </>
                                }
                                sx={{ mr: 2 }}
                              />
                              <Typography variant="subtitle1" fontWeight={600}>
                                {item.product.price * item.quantity} créditos
                              </Typography>
                            </ListItem>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </List>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
                    <Paper
                      elevation={3}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: "linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)",
                        border: "1px solid rgba(0, 0, 0, 0.05)",
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Total del Pedido
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 3,
                        }}
                      >
                        <Typography variant="subtitle1">Subtotal:</Typography>
                        <Typography variant="subtitle1">{total} créditos</Typography>
                      </Box>
                      <Divider sx={{ my: 2 }} />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 3,
                        }}
                      >
                        <Typography variant="h6" fontWeight={700}>
                          Total:
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="primary.main">
                          {total} créditos
                        </Typography>
                      </Box>

                      {user ? (
                        <>
                          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                            <Payment sx={{ verticalAlign: "middle", mr: 1 }} />
                            Método de Pago
                          </Typography>
                          <RadioGroup
                            value={selectedPaymentMethod}
                            onChange={(e) =>
                              setSelectedPaymentMethod(e.target.value as "credits" | number)
                            }
                          >
                            <Paper
                              elevation={selectedPaymentMethod === "credits" ? 3 : 0}
                              sx={{
                                mb: 2,
                                p: 2,
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor:
                                  selectedPaymentMethod === "credits"
                                    ? "primary.main"
                                    : "divider",
                                transition: "all 0.3s ease",
                                "&:hover": {
                                  borderColor: "primary.main",
                                  backgroundColor: "action.hover",
                                },
                              }}
                            >
                              <FormControlLabel
                                value="credits"
                                control={
                                  <Radio
                                    icon={<AccountBalanceWallet />}
                                    checkedIcon={<AccountBalanceWallet color="primary" />}
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography>Pagar con créditos</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Disponibles: {credits}
                                    </Typography>
                                    {credits < total && (
                                      <Alert
                                        severity="error"
                                        sx={{ mt: 1, fontSize: "0.75rem", py: 0 }}
                                      >
                                        Créditos insuficientes
                                      </Alert>
                                    )}
                                  </Box>
                                }
                                disabled={credits < total}
                                sx={{ width: "100%", m: 0 }}
                              />
                            </Paper>

                            {paymentMethods.map((method) => (
                              <Paper
                                key={method.id}
                                elevation={selectedPaymentMethod === method.id ? 3 : 0}
                                sx={{
                                  mb: 2,
                                  p: 2,
                                  borderRadius: 1,
                                  border: "1px solid",
                                  borderColor:
                                    selectedPaymentMethod === method.id
                                      ? "primary.main"
                                      : "divider",
                                  transition: "all 0.3s ease",
                                  "&:hover": {
                                    borderColor: "primary.main",
                                    backgroundColor: "action.hover",
                                  },
                                }}
                              >
                                <FormControlLabel
                                  value={method.id}
                                  control={
                                    <Radio
                                      icon={<CreditCard />}
                                      checkedIcon={<CreditCard color="primary" />}
                                    />
                                  }
                                  label={
                                    <Box>
                                      <Typography>
                                        {method.payment_type === "credit_card"
                                          ? "Tarjeta de Crédito"
                                          : method.payment_type}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {method.details}
                                      </Typography>
                                    </Box>
                                  }
                                  sx={{ width: "100%", m: 0 }}
                                />
                              </Paper>
                            ))}
                          </RadioGroup>
                        </>
                      ) : (
                        <Alert
                          severity="warning"
                          icon={<Lock fontSize="inherit" />}
                          sx={{ mb: 3 }}
                        >
                          <Typography variant="body2">
                            Para comprar productos de pago,{" "}
                            <Link href="/auth/login" color="inherit" fontWeight={600}>
                              inicia sesión
                            </Link>{" "}
                            o{" "}
                            <Link href="/auth/register" color="inherit" fontWeight={600}>
                              regístrate
                            </Link>
                            .
                          </Typography>
                        </Alert>
                      )}

                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleCheckout}
                        disabled={loading || (user && selectedPaymentMethod === "credits" && credits < total)}
                        fullWidth
                        size="large"
                        endIcon={
                          loading ? (
                            <CircularProgress size={24} color="inherit" />
                          ) : (
                            <ArrowForward />
                          )
                        }
                        sx={{
                          mt: 2,
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 600,
                          fontSize: "1rem",
                          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                          boxShadow: "0 4px 6px rgba(79, 70, 229, 0.3)",
                          "&:hover": {
                            boxShadow: "0 6px 10px rgba(79, 70, 229, 0.4)",
                            transform: "translateY(-1px)",
                          },
                          "&:disabled": {
                            background: "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
                          },
                        }}
                      >
                        {loading
                          ? "Procesando..."
                          : cartItems.every((item) => item.product.is_free)
                          ? "Obtener Gratis"
                          : "Pagar Ahora"}
                      </Button>
                    </Paper>
                  </motion.div>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
        >
          <Alert
            onClose={() => setSuccessMessage(null)}
            severity="success"
            sx={{ width: "100%", boxShadow: 3 }}
            icon={<LocalAtm fontSize="inherit" />}
          >
            {successMessage}
          </Alert>
        </motion.div>
      </Snackbar>
    </Box>
  );
}