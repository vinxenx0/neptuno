// frontend/src/app/checkout/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import fetchAPI from "@/lib/api";
import { CartItem, Order } from "@/lib/types";
import { Box, Typography, Button, List, ListItem, ListItemText } from "@mui/material";

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
    if (credits < total) {
      alert("No tienes suficientes créditos");
      return;
    }
    const order = { items: cartItems.map(item => ({ product_id: item.product_id, quantity: item.quantity })) };
    const { data } = await fetchAPI<Order>("/v1/marketplace/orders", { method: "POST", data: order });
    if (data) {
      window.location.href = "/user/dashboard"; // Redirigir al dashboard tras éxito
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">Carrito de Compras</Typography>
      <List>
        {cartItems.map(item => (
          <ListItem key={item.id}>
            <ListItemText primary={item.product.name} secondary={`Cantidad: ${item.quantity} - Precio: ${item.product.price}`} />
          </ListItem>
        ))}
      </List>
      <Typography variant="h6">Total: {total} créditos</Typography>
      <Button variant="contained" onClick={handleCheckout}>Realizar Checkout</Button>
    </Box>
  );
}