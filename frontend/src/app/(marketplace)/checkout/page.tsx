// frontend/src/app/checkout/page.tsx
// frontend/src/app/checkout/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import fetchAPI from "@/lib/api";
import { CartItem, Order } from "@/lib/types";
import { Box, Typography, Button, List, ListItem, ListItemText } from "@mui/material";
import { motion } from "framer-motion";

export default function CheckoutPage() {
  const { user, credits } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchCart = async () => {
      const { data } = await fetchAPI<CartItem[]>("/v1/marketplace/cart");
      setCartItems(data || []);
      const totalAmount = data?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;
      setTotal(totalAmount);
    };
    fetchCart();
  }, []);

  const handleCheckout = async () => {
    const hasPaidItems = cartItems.some(item => !item.product.is_free);
    if (hasPaidItems && !user) {
      alert("Debes registrarte para comprar productos de pago");
      return;
    }
    if (hasPaidItems && credits < total) {
      alert("No tienes suficientes créditos");
      return;
    }
    const order = { items: cartItems.map(item => ({ product_id: item.product_id, quantity: item.quantity })) };
    const { data } = await fetchAPI<Order>("/v1/marketplace/orders", { method: "POST", data: order });
    if (data) {
      window.location.href = "/user/dashboard";
    }
  };

  return (
    <Box sx={{ p: 4, minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>Carrito de Compras</Typography>
        <List>
          {cartItems.map(item => (
            <ListItem key={item.id}>
              <ListItemText
                primary={item.product.name}
                secondary={`Cantidad: ${item.quantity} - Precio: ${item.product.price} créditos`}
              />
            </ListItem>
          ))}
        </List>
        <Typography variant="h6" sx={{ mt: 2 }}>Total: {total} créditos</Typography>
        <Button
          variant="contained"
          onClick={handleCheckout}
          sx={{ mt: 2 }}
        >
          {cartItems.every(item => item.product.is_free) ? "Obtener Gratis" : "Pagar"}
        </Button>
      </motion.div>
    </Box>
  );
}