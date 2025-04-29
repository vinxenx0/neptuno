// frontend/src/components/marketplace/Marketplace.tsx
import { useEffect, useState } from "react";
import fetchAPI from "@/lib/api";
import { Category, Product } from "@/lib/types";
import { Box, Typography, Grid, Card, CardContent, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { useAuth } from "@/lib/auth/context";
import { motion } from "framer-motion";

export default function Marketplace() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const { data: catData } = await fetchAPI<Category[]>("/v1/marketplace/categories");
      setCategories(catData || []);
      const { data: prodData } = await fetchAPI<Product[]>("/v1/marketplace/products");
      setProducts(prodData || []);
    };
    fetchData();
  }, []);

  const handleAddToCart = async (productId: number) => {
    try {
      await fetchAPI("/v1/marketplace/cart", { method: "POST", data: { product_id: productId, quantity: 1 } });
      alert("Producto añadido al carrito");
    } catch (error) {
      alert("Error al añadir al carrito");
    }
  };

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(product => product.category_id === selectedCategory);

  return (
    <Box sx={{ p: 4, minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>Marketplace</Typography>
        <FormControl fullWidth sx={{ mb: 3, maxWidth: 300 }}>
          <InputLabel>Categoría</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as number | "all")}
          >
            <MenuItem value="all">Todas</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Grid container spacing={3}>
          {filteredProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card sx={{ borderRadius: "12px", boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6">{product.name}</Typography>
                  <Typography color="textSecondary">{product.description}</Typography>
                  <Typography sx={{ mt: 1 }}>Precio: {product.price} créditos</Typography>
                  <Button
                    variant="contained"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={!product.is_free && !user}
                    sx={{ mt: 2 }}
                  >
                    {product.is_free ? "Obtener Gratis" : "Añadir al Carrito"}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </motion.div>
    </Box>
  );
}