// frontend/src/app/(marketplace)/marketplace/order/[id]/page.tsx
"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import fetchAPI from "@/lib/api";
import { Order } from "@/lib/types";
import OrderSuccessClient from "./OrderSuccessClient";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { ShoppingBag } from "@mui/icons-material";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await fetchAPI<Order>(`/v1/marketplace/orders/${id}`);
        setOrder(data);
      } catch (error) {
        console.error("Error fetching order:", error);
      }
    };
    fetchOrder();
  }, [id]);

  if (!order) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)'
      }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <ShoppingBag sx={{ fontSize: 60, color: 'primary.main' }} />
        </motion.div>
      </Box>
    );
  }

  return <OrderSuccessClient order={order} />;
}