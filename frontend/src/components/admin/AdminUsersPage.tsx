// src/components/admin/AdminUsersPage.tsx
// src/components/admin/AdminUsersPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import { getAllUsers, updateUser, deleteUser, createUser } from "@/lib/api";
import { User, RegisterRequest, UpdateProfileRequest } from "@/lib/types";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Pagination,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Edit, Delete } from "@mui/icons-material";
import { motion } from "framer-motion";

const AdminUsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "update">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<RegisterRequest | Omit<UpdateProfileRequest, 'password'>>({
    email: "",
    username: "",
    password: "",
    ciudad: "",
    website: "",
  });

  // Estado para la paginación
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  useEffect(() => {
    if (user?.rol !== "admin") {
      setError("No tienes permisos para acceder a esta página");
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [user, pagination.page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAllUsers(pagination.page, pagination.limit);
  
      if (response.error) {
        let errorMessage: string;
        
        if (typeof response.error === 'string') {
          errorMessage = response.error;
        } else if ('detail' in response.error) {
          // Manejo de errores de validación HTTP
          if (Array.isArray(response.error.detail)) {
            errorMessage = response.error.detail.map(d => d.msg).join(', ');
          } else {
            errorMessage = response.error.detail || 'Error de validación';
          }
        } else {
          errorMessage = JSON.stringify(response.error);
        }
        
        setError(errorMessage);
      } else if (response.data) {
        setUsers(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          totalItems: response.data?.total_items || 0,
          totalPages: response.data?.total_pages || 1
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    }
    setLoading(false);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleOpenDialog = (mode: "create" | "update", user?: User) => {
    setFormMode(mode);
    setSelectedUser(user || null);
    setFormData(
      user
        ? {
          email: user.email,
          username: user.username,
          ciudad: user.ciudad || "",
          website: user.website || ""
        }
        : {
          email: "",
          username: "",
          password: "",
          ciudad: "",
          website: ""
        }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (formMode === 'update' && name === 'password') return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = async () => {
    try {
      if (formMode === "create") {
        await createUser(formData as RegisterRequest);
      } else if (selectedUser) {
        await updateUser(selectedUser.id, formData as UpdateProfileRequest);
      }
      fetchUsers();
      handleCloseDialog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar usuario");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      try {
        await deleteUser(userId);
        fetchUsers();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al eliminar usuario");
      }
    }
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "email", headerName: "Email", width: 200 },
    { field: "username", headerName: "Username", width: 150 },
    { field: "rol", headerName: "Rol", width: 120 },
    { field: "credits", headerName: "Créditos", width: 120 },
    { field: "activo", headerName: "Activo", width: 100, type: "boolean" },
    {
      field: "actions",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton onClick={() => handleOpenDialog("update", params.row)}>
            <Edit />
          </IconButton>
          <IconButton onClick={() => handleDeleteUser(params.row.id)}>
            <Delete />
          </IconButton>
        </>
      ),
    },
  ];

  if (loading && users.length === 0) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ fontSize: "2rem", fontWeight: "bold", mb: 4 }}>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Gestión de Usuarios
        </motion.h1>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={() => handleOpenDialog("create")}
        sx={{ mb: 4 }}
      >
        Crear Nuevo Usuario
      </Button>

      <Box sx={{ height: 600, width: '100%', mb: 2 }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          pageSizeOptions={[pagination.limit]}
          disableRowSelectionOnClick
          autoHeight
          sx={{ borderRadius: 2, boxShadow: 2 }}
          rowCount={pagination.totalItems}
          paginationMode="server"
          paginationModel={{
            page: pagination.page - 1,
            pageSize: pagination.limit
          }}
          onPaginationModelChange={(model) => {
            setPagination(prev => ({
              ...prev,
              page: model.page + 1
            }));
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Pagination
          count={pagination.totalPages}
          page={pagination.page}
          onChange={handlePageChange}
          color="primary"
          showFirstButton
          showLastButton
        />
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{formMode === "create" ? "Crear Usuario" : "Actualizar Usuario"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required={formMode === "create"}
          />
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required={formMode === "create"}
          />
          {formMode === "create" && (
            <TextField
              label="Password"
              name="password"
              type="password"
              value={(formData as RegisterRequest).password || ""}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
            />
          )}
          <TextField
            label="Ciudad"
            name="ciudad"
            value={formData.ciudad || ""}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Website"
            name="website"
            value={formData.website || ""}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button onClick={handleSaveUser} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsersPage;