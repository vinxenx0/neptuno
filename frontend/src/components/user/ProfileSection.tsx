import { useState } from "react";
import { Box, Typography, TextField, Button, List, ListItem, ListItemAvatar, ListItemText, Avatar, Divider, IconButton } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { Edit, Person, AccountCircle, LocationOn, Language } from "@mui/icons-material";
import { GlassCard } from "./StyledComponents";

export default function ProfileSection({ user, updateProfile }) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    email: user.email || "",
    username: user.username || "",
    ciudad: user.ciudad || "",
    website: user.website || "",
  });
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setSuccess("Perfil actualizado");
      setEditMode(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar perfil");
    }
  };

  return (
    <GlassCard>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5">Información Personal</Typography>
          <IconButton onClick={() => setEditMode(!editMode)}>
            <Edit color="primary" />
          </IconButton>
        </Box>
        <AnimatePresence mode="wait">
          {editMode ? (
            <Box
              component={motion.form}
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleUpdate}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
                variant="outlined"
                size="small"
              />
              <TextField
                label="Username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                fullWidth
                variant="outlined"
                size="small"
              />
              <TextField
                label="Ciudad"
                type="text"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{ startAdornment: <LocationOn color="action" sx={{ mr: 1 }} /> }}
              />
              <TextField
                label="Website"
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                fullWidth
                variant="outlined"
                size="small"
                InputProps={{ startAdornment: <Language color="action" sx={{ mr: 1 }} /> }}
              />
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button type="submit" variant="contained" color="primary" sx={{ flex: 1 }}>
                  Guardar Cambios
                </Button>
                <Button onClick={() => setEditMode(false)} variant="outlined" sx={{ flex: 1 }}>
                  Cancelar
                </Button>
              </Box>
            </Box>
          ) : (
            <Box component={motion.div} key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <List>
                <ListItem>
                  <ListItemAvatar><Avatar><Person /></Avatar></ListItemAvatar>
                  <ListItemText primary="Username" secondary={user.username || "No especificado"} />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar><Avatar><AccountCircle /></Avatar></ListItemAvatar>
                  <ListItemText primary="Email" secondary={user.email || "No especificado"} />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar><Avatar><LocationOn /></Avatar></ListItemAvatar>
                  <ListItemText primary="Ciudad" secondary={user.ciudad || "No especificado"} />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem>
                  <ListItemAvatar><Avatar><Language /></Avatar></ListItemAvatar>
                  <ListItemText primary="Website" secondary={user.website || "No especificado"} />
                </ListItem>
              </List>
            </Box>
          )}
        </AnimatePresence>
        {success && <Typography color="success.main">{success}</Typography>}
        {error && <Typography color="error.main">{error}</Typography>}
      </Box>
    </GlassCard>
  );
}