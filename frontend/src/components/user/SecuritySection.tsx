import { useState } from "react";
import { Box, Typography, TextField, Button } from "@mui/material";
import { Lock, Security } from "@mui/icons-material";
import fetchAPI from "@/lib/api";
import { GlassCard } from "./StyledComponents";
import { FetchResponse } from "@/lib/types";

export default function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data }: FetchResponse<{ message: string }> = await fetchAPI(
        "/v1/auth/me/password",
        {
          method: "PUT",
          data: { current_password: currentPassword, new_password: newPassword },
        }
      );
      setSuccess(data?.message || "Contraseña actualizada");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar contraseña");
    }
  };

  return (
    <GlassCard>
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Cambiar Contraseña
        </Typography>
        <Box
          component="form"
          onSubmit={handleChangePassword}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            label="Contraseña Actual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            fullWidth
            required
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: <Lock color="action" sx={{ mr: 1 }} />,
            }}
          />
          <TextField
            label="Nueva Contraseña"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            required
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: <Security color="action" sx={{ mr: 1 }} />,
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 1 }}
          >
            Actualizar Contraseña
          </Button>
        </Box>
        {success && <Typography color="success.main">{success}</Typography>}
        {error && <Typography color="error.main">{error}</Typography>}
      </Box>
    </GlassCard>
  );
}