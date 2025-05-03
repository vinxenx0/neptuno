// frontend/src/app/%28marketplace%29/marketplace/order/%5Bid%5D/page.tsx
"use client"; //  cannot use both "use client" and export function "generateStaticParams()".]
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import fetchAPI from "@/lib/api";
import { Order, OrderItem } from "@/lib/types";
import { Box, Typography, Button, List, ListItem, ListItemText, Divider } from "@mui/material";
import { motion } from "framer-motion";

// Generar parámetros estáticos
// Ensure generateStaticParams is implemented robustly for static export

// Update the PageProps type to match the expected structure
interface PageProps {
  params: Promise<{ id: string }>;
}
// export default async function OrderSuccessPage({ params }: PageProps) {

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const { data } = await fetchAPI<Order>(`/v1/marketplace/orders/${id}`);
      setOrder(data);
    };
    fetchOrder();
  }, [id]);

  if (!order) return <Typography>Cargando...</Typography>;

  return (
    <Box sx={{ p: 4, minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" sx={{ mb: 3 }}>¡Compra Exitosa!</Typography>
        <Typography variant="h6">Orden #{order.id}</Typography>
        <Typography>Fecha: {new Date(order.created_at).toLocaleString()}</Typography>
        <Typography>Estado: {order.status}</Typography>
        <Typography>Total: {order.total_amount} créditos</Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6">Detalles de la Orden</Typography>
        <List>
          {order.items.map((item: OrderItem) => (
            <ListItem key={item.id}>
              <ListItemText
                primary={item.product_name}
                secondary={`Cantidad: ${item.quantity} - Precio: ${item.price} créditos`}
              />
              {item.is_digital && item.file_path && (
                <Button href={item.file_path} download variant="outlined" sx={{ ml: 2 }}>
                  Descargar
                </Button>
              )}
            </ListItem>
          ))}
        </List>
        <Button variant="contained" onClick={() => window.location.href = "/marketplace"} sx={{ mt: 2 }}>
          Volver al Marketplace
        </Button>
      </motion.div>
    </Box>
  );
}