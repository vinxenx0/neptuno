// frontend/src/components/marketplace/Marketplace.tsx
import { useEffect, useState } from "react";
import fetchAPI from "@/lib/api";
import { Category, Product, CartItem } from "@/lib/types";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton
} from "@mui/material";
import { useAuth } from "@/lib/auth/context";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  AddShoppingCart,
  LocalOffer,
  Category as CategoryIcon,
  Download,
  Star
} from "@mui/icons-material";
import Link from "next/link";

// Animaciones
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

const hoverVariants = {
  hover: {
    y: -5,
    scale: 1.02,
    transition: { duration: 0.3 }
  }
};

export default function Marketplace() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: catData }, { data: prodData }, { data: cartData }] = await Promise.all([
        fetchAPI<Category[]>("/v1/marketplace/categories"),
        fetchAPI<Product[]>("/v1/marketplace/products"),
        fetchAPI<CartItem[]>("/v1/marketplace/cart")
      ]);
      setCategories(catData || []);
      setProducts(prodData || []);
      setCartItems(cartData || []);
    };
    fetchData();
  }, []);

  const handleAddToCart = async (productId: number) => {
    try {
      await fetchAPI("/v1/marketplace/cart", { method: "POST", data: { product_id: productId, quantity: 1 } });
      const { data: updatedCart } = await fetchAPI<CartItem[]>("/v1/marketplace/cart");
      setCartItems(updatedCart || []);
    } catch (error) {
      alert("Error al añadir al carrito");
    }
  };

  const isInCart = (productId: number) => cartItems.some(item => item.product_id === productId);

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(product => product.category_id === selectedCategory);

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
          maxWidth: "1400px",
          mx: "auto",
          borderRadius: 4,
          boxShadow: "0 10px 30px rgba(0, 0, 100, 0.1)",
          overflow: "hidden",
        }}>
          <Box sx={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            color: "white",
            p: 3,
          }}>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
              <LocalOffer sx={{ verticalAlign: 'middle', mr: 2 }} />
              Marketplace
            </Typography>
            
            <FormControl fullWidth sx={{ maxWidth: 400 }}>
              <InputLabel sx={{ color: 'white' }}>Categoría</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as number | "all")}
                sx={{
                  '& .MuiSelect-select': { color: 'white' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255, 255, 255, 0.5)' }
                }}
              >
                <MenuItem value="all" sx={{ display: 'flex', gap: 1 }}>
                  <CategoryIcon /> Todas
                </MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id} sx={{ display: 'flex', gap: 1 }}>
                    <CategoryIcon /> {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Grid container spacing={3}>
              <AnimatePresence>
                {filteredProducts.map((product, index) => (
                  <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <motion.div
                      variants={itemVariants}
                      custom={index}
                      whileHover="hover"
                    >
                      <Card sx={{
                        height: '100%',
                        borderRadius: 3,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Avatar sx={{
                              bgcolor: 'primary.light',
                              color: 'primary.dark',
                              mr: 2
                            }}>
                              {product.is_digital ? <Download /> : <ShoppingCart />}
                            </Avatar>
                            <Typography variant="h6" fontWeight={600}>
                              <Link href={`/marketplace/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                {product.name}
                              </Link>
                            </Typography>
                          </Box>

                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {product.description}
                          </Typography>

                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Chip
                              label={`${product.price} créditos`}
                              color="primary"
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                            {product.rating && (
                              <Chip
                                label={`⭐ ${product.rating}`}
                                color="secondary"
                                variant="filled"
                              />
                            )}
                          </Box>

                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            {isInCart(product.id) ? (
                              <Button
                                fullWidth
                                variant="contained"
                                disabled
                                startIcon={<AddShoppingCart />}
                                sx={{
                                  bgcolor: 'success.light',
                                  color: 'success.contrastText',
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  py: 1.5
                                }}
                              >
                                En el Carrito
                              </Button>
                            ) : (
                              <Button
                                fullWidth
                                variant="contained"
                                onClick={() => handleAddToCart(product.id)}
                                disabled={!product.is_free && !user}
                                startIcon={<AddShoppingCart />}
                                sx={{
                                  background: product.is_free 
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                                    : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                  color: 'white',
                                  fontWeight: 600,
                                  borderRadius: 2,
                                  py: 1.5,
                                  '&:hover': {
                                    boxShadow: '0 4px 8px rgba(79, 70, 229, 0.3)'
                                  }
                                }}
                              >
                                {product.is_free ? "Obtener Gratis" : "Añadir al Carrito"}
                              </Button>
                            )}
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </AnimatePresence>
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}