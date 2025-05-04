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
} from "@mui/material";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Delete } from "@mui/icons-material";

export default function CheckoutPage() {
  const { user, credits } = useAuth();
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]); // Métodos de pago registrados
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
    <Box sx={{ p: 4, minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>Finalizar Compra</Typography>
        {cartItems.length === 0 ? (
          <Typography variant="body1">Tu carrito está vacío</Typography>
        ) : (
          <Box sx={{ maxWidth: "800px", mx: "auto" }}>
            <List sx={{ mb: 3 }}>
              {cartItems.map((item) => (
                <ListItem key={item.id} sx={{ py: 2 }}>
                  <ListItemText
                    primary={item.product.name}
                    secondary={`Cantidad: ${item.quantity} - Precio unitario: ${item.product.price} créditos`}
                  />
                  <Typography>{item.product.price * item.quantity} créditos</Typography>
                  <IconButton onClick={() => handleRemoveFromCart(item.id)}>
                    <Delete />
                  </IconButton>
                </ListItem>
              ))}
            </List>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="h6" sx={{ mb: 2 }}>Total: {total} créditos</Typography>

            {user ? (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>Método de Pago</Typography>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value as "credits" | number)}
                >
                  <FormControlLabel
                    value="credits"
                    control={<Radio />}
                    label={`Pagar con créditos (Disponibles: ${credits})`}
                    disabled={credits < total}
                  />
                  {paymentMethods.map((method) => (
                    <FormControlLabel
                      key={method.id}
                      value={method.id}
                      control={<Radio />}
                      label={`${method.payment_type} - ${method.details}`}
                    />
                  ))}
                </RadioGroup>
              </Box>
            ) : (
              <Typography sx={{ mb: 2, color: "warning.main" }}>
                ¡Parece que aún no has iniciado sesión! Para comprar productos de pago,{" "}
                <a href="/auth/login">inicia sesión</a> o{" "}
                <a href="/auth/register">regístrate</a> y disfruta de una experiencia completa.
              </Typography>
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleCheckout}
              disabled={loading}
              sx={{ mt: 2, minWidth: "200px" }}
            >
              {loading ? <CircularProgress size={24} /> : cartItems.every((item) => item.product.is_free) ? "Obtener Gratis" : "Pagar Ahora"}
            </Button>
          </Box>
        )}
      </motion.div>
      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => setSuccessMessage(null)}>
        <Alert onClose={() => setSuccessMessage(null)} severity="success" sx={{ width: "100%" }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}