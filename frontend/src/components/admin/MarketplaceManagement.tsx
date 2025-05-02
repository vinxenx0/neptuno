// frontend/src/components/admin/MarketplaceManagement.tsx
import { useState, useEffect } from "react";
import fetchAPI from "@/lib/api";
import { Category, Product } from "@/lib/types";
import {
  Box, Typography, Button, TextField, Table, TableBody, TableCell, TableHead, TableRow,
  IconButton, Switch, FormControlLabel
} from "@mui/material";
import { AddCircle, Delete, Edit } from "@mui/icons-material";

export default function MarketplaceManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    is_digital: false,
    is_free: false,
    file_path: "",
    subscription_duration: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const { data: catData } = await fetchAPI<Category[]>("/v1/marketplace/categories");
      setCategories(catData || []);
      const { data: prodData } = await fetchAPI<Product[]>("/v1/marketplace/products");
      setProducts(prodData || []);
    };
    fetchData();
  }, []);

  const handleAddCategory = async () => {
    const { data } = await fetchAPI<Category>("/v1/marketplace/categories", { method: "POST", data: newCategory });
    if (data) {
      setCategories([...categories, data]);
      setNewCategory({ name: "", description: "" });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    await fetchAPI(`/v1/marketplace/categories/${id}`, { method: "DELETE" });
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleAddProduct = async () => {
    const productData = {
      name: newProduct.name,
      description: newProduct.description || undefined,
      price: newProduct.is_free ? 0 : parseFloat(newProduct.price) || 0,
      category_id: parseInt(newProduct.category_id) || 0,
      is_digital: newProduct.is_digital,
      is_free: newProduct.is_free,
      file_path: newProduct.is_digital ? newProduct.file_path : undefined,
      subscription_duration: newProduct.subscription_duration ? parseInt(newProduct.subscription_duration) : undefined,
    };

    if (!productData.name || productData.price <= 0 || !productData.category_id) {
      alert("Nombre, precio y categoría son obligatorios y deben ser válidos");
      return;
    }

    const { data } = await fetchAPI<Product>("/v1/marketplace/products", { method: "POST", data: productData });
    if (data) {
      setProducts([...products, data]);
      setNewProduct({ name: "", description: "", price: "", category_id: "", is_digital: false, is_free: false, file_path: "", subscription_duration: "" });
    }
  };

  const handleDeleteProduct = async (id: number) => {
    await fetchAPI(`/v1/marketplace/products/${id}`, { method: "DELETE" });
    setProducts(products.filter(prod => prod.id !== id));
  };

  return (
    <Box>
      <Typography variant="h6">Gestión de Categorías</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <TextField label="Nombre" value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} />
        <TextField label="Descripción" value={newCategory.description} onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })} />
        <Button variant="contained" onClick={handleAddCategory} startIcon={<AddCircle />}>Añadir Categoría</Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Descripción</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell>{cat.name}</TableCell>
              <TableCell>{cat.description}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDeleteCategory(cat.id)}><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="h6" sx={{ mt: 4 }}>Gestión de Productos</Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
        <TextField label="Nombre" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
        <TextField label="Descripción" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
        <TextField label="Precio" type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
        <TextField label="Categoría ID" type="number" value={newProduct.category_id} onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })} />
        <FormControlLabel
          control={<Switch checked={newProduct.is_digital} onChange={(e) => setNewProduct({ ...newProduct, is_digital: e.target.checked })} />}
          label="Producto Digital"
        />
       <FormControlLabel
  control={
    <Switch
      checked={newProduct.is_free}
      onChange={(e) => setNewProduct({ ...newProduct, is_free: e.target.checked })}
    />
  }
  label="Producto Gratuito"
/>
<TextField
  label="Precio"
  type="number"
  value={newProduct.price}
  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
  disabled={newProduct.is_free}
  required={!newProduct.is_free}
/>
        {newProduct.is_digital && (
          <TextField label="Archivo" value={newProduct.file_path} onChange={(e) => setNewProduct({ ...newProduct, file_path: e.target.value })} />
        )}
        <TextField label="Duración Suscripción (días)" type="number" value={newProduct.subscription_duration} onChange={(e) => setNewProduct({ ...newProduct, subscription_duration: e.target.value })} />
        <Button variant="contained" onClick={handleAddProduct} startIcon={<AddCircle />}>Añadir Producto</Button>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Precio</TableCell>
            <TableCell>Categoría</TableCell>
            <TableCell>Digital</TableCell>
            <TableCell>Gratuito</TableCell>
            <TableCell>Duración</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((prod) => (
            <TableRow key={prod.id}>
              <TableCell>{prod.name}</TableCell>
              <TableCell>{prod.price}</TableCell>
              <TableCell>{prod.category_id}</TableCell>
              <TableCell>{prod.is_digital ? "Sí" : "No"}</TableCell>
              <TableCell>{prod.is_free ? "Sí" : "No"}</TableCell>
              <TableCell>{prod.subscription_duration || "N/A"}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleDeleteProduct(prod.id)}><Delete /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}