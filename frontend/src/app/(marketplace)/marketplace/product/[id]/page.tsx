// frontend/src/app/(marketplace)/marketplace/product/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import fetchAPI from "@/lib/api";
import { Product } from "@/lib/types";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
  useTheme,
} from "@mui/material";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Download,
  Star,
  ArrowBack,
} from "@mui/icons-material";
import Link from "next/link";

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const theme = useTheme();

  useEffect(() => {
    const fetchProduct = async () => {
      const { data } = await fetchAPI<Product>(`/v1/marketplace/products/${id}`);
      setProduct(data);
    };
    fetchProduct();
  }, [id]);

  if (!product) return <Typography>Cargando...</Typography>;

  return (
    <Box sx={{ p: 4, minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Card sx={{ borderRadius: "12px", boxShadow: 3, maxWidth: "800px", mx: "auto" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                {product.is_digital ? <Download /> : <ShoppingCart />}
              </Avatar>
              <Typography variant="h4" fontWeight={600}>{product.name}</Typography>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="body1" sx={{ mb: 2 }}>{product.description}</Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Chip label={`Precio: ${product.price} créditos`} color="primary" />
              {product.rating && <Chip label={`Rating: ${product.rating}`} icon={<Star />} />}
            </Box>
            <Button
              variant="contained"
              startIcon={<ShoppingCart />}
              onClick={() => {/* Lógica para añadir al carrito */}}
              sx={{ mr: 2 }}
            >
              Añadir al Carrito
            </Button>
            <Link href="/marketplace" passHref>
              <Button variant="outlined" startIcon={<ArrowBack />}>
                Volver
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}