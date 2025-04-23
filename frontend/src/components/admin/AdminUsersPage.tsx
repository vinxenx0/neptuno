// src/components/admin/AdminUsersPage.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
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
  Avatar,
  Chip,
  Paper,
  Typography,
  Divider,
  useTheme,
  styled
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { Edit, Delete, Add, Person, Lock, Email, Language, LocationOn, VerifiedUser } from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

// Styled Components
const AdminGlassCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4)
}));

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: theme.shadows[2],
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    borderRadius: '12px 12px 0 0'
  },
  '& .MuiDataGrid-cell': {
    borderBottom: `1px solid ${theme.palette.divider}`
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  borderRadius: '8px'
}));

const AdminUsersPage = () => {
  const theme = useTheme();
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

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllUsers(pagination.page, pagination.limit);
  
      if (response.error) {
        let errorMessage: string;
        
        if (typeof response.error === 'string') {
          errorMessage = response.error;
        } else if ('detail' in response.error) {
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
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    if (user?.rol !== "admin") {
      setError("No tienes permisos para acceder a esta página");
      setLoading(false);
      return;
    }
    fetchUsers();
  }, [user, pagination.page, fetchUsers]);

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
    { 
      field: "id", 
      headerName: "ID", 
      width: 90,
      renderCell: (params) => (
        <Typography variant="body2" color="textSecondary">
          #{params.value}
        </Typography>
      )
    },
    { 
      field: "email", 
      headerName: "Email", 
      width: 220,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email color="primary" sx={{ fontSize: 16 }} />
          <Typography variant="body2">
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: "username", 
      headerName: "Usuario", 
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 24, height: 24, bgcolor: theme.palette.primary.main }}>
            <Person sx={{ fontSize: 14 }} />
          </Avatar>
          <Typography variant="body2">
            {params.value}
          </Typography>
        </Box>
      )
    },
    { 
      field: "rol", 
      headerName: "Rol", 
      width: 120,
      renderCell: (params) => (
        <StatusChip 
          label={params.value} 
          color={params.value === 'admin' ? 'secondary' : 'primary'}
          size="small"
          icon={params.value === 'admin' ? <VerifiedUser sx={{ fontSize: 14 }} /> : undefined}
        />
      )
    },
    { 
      field: "credits", 
      headerName: "Créditos", 
      width: 120,
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color="primary" 
          variant="outlined"
          size="small"
        />
      )
    },
    { 
      field: "activo", 
      headerName: "Estado", 
      width: 120,
      renderCell: (params) => (
        <StatusChip 
          label={params.value ? 'Activo' : 'Inactivo'} 
          color={params.value ? 'success' : 'error'}
          size="small"
        />
      )
    },
    {
      field: "actions",
      headerName: "Acciones",
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={() => handleOpenDialog("update", params.row)}
            sx={{ 
              backgroundColor: theme.palette.primary.light,
              '&:hover': { backgroundColor: theme.palette.primary.main }
            }}
          >
            <Edit sx={{ color: theme.palette.primary.contrastText }} />
          </IconButton>
          <IconButton 
            onClick={() => handleDeleteUser(params.row.id)}
            sx={{ 
              backgroundColor: theme.palette.error.light,
              '&:hover': { backgroundColor: theme.palette.error.main }
            }}
          >
            <Delete sx={{ color: theme.palette.error.contrastText }} />
          </IconButton>
        </Box>
      ),
    },
  ];

  if (loading && users.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '16px'
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 6 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 1,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}
          >
            Gestión de Usuarios
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Administra todos los usuarios del sistema
          </Typography>
        </motion.div>
      </Box>

      <AdminGlassCard>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Total de usuarios: {pagination.totalItems}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenDialog("create")}
            startIcon={<Add />}
            sx={{
              borderRadius: '12px',
              px: 4,
              py: 1.5,
              fontWeight: 'bold'
            }}
          >
            Nuevo Usuario
          </Button>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ height: 600, width: '100%', mb: 2 }}>
          <StyledDataGrid
            rows={users}
            columns={columns}
            loading={loading}
            pageSizeOptions={[pagination.limit]}
            disableRowSelectionOnClick
            autoHeight
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
            sx={{
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center'
              }
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
            sx={{ 
              '& .MuiPaginationItem-root': {
                borderRadius: '8px'
              }
            }}
          />
        </Box>
      </AdminGlassCard>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 'bold',
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          color: 'white',
          borderRadius: '16px 16px 0 0'
        }}>
          {formMode === "create" ? "Crear Nuevo Usuario" : "Editar Usuario"}
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required={formMode === "create"}
            InputProps={{
              startAdornment: <Email color="action" sx={{ mr: 1 }} />
            }}
            sx={{ mb: 3 }}
          />
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required={formMode === "create"}
            InputProps={{
              startAdornment: <Person color="action" sx={{ mr: 1 }} />
            }}
            sx={{ mb: 3 }}
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
              InputProps={{
                startAdornment: <Lock color="action" sx={{ mr: 1 }} />
              }}
              sx={{ mb: 3 }}
            />
          )}
          <TextField
            label="Ciudad"
            name="ciudad"
            value={formData.ciudad || ""}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: <LocationOn color="action" sx={{ mr: 1 }} />
            }}
            sx={{ mb: 3 }}
          />
          <TextField
            label="Website"
            name="website"
            value={formData.website || ""}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            InputProps={{
              startAdornment: <Language color="action" sx={{ mr: 1 }} />
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            sx={{ borderRadius: '12px', px: 3 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveUser} 
            variant="contained" 
            color="primary"
            sx={{ borderRadius: '12px', px: 3 }}
          >
            {formMode === "create" ? "Crear Usuario" : "Guardar Cambios"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ 
              borderRadius: '12px',
              boxShadow: theme.shadows[6]
            }}
          >
            {error}
          </Alert>
        </motion.div>
      </Snackbar>
    </Box>
  );
};

export default AdminUsersPage;