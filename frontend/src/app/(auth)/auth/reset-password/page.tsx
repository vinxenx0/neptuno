// frontend/src/app/(auth)/auth/reset-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import fetchAPI from "@/lib/api";
import { TextField, Alert, Typography, Button, Box } from "@mui/material";
import { Email, VpnKey, VerifiedUser, Lock } from "@mui/icons-material";
import AuthLayout from "@/components/auth/AuthLayout";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await fetchAPI<{ message: string; token?: string }>("/v1/auth/password-reset", {
        method: "POST",
        data: { email },
      });
      if (error) throw new Error(error as string);
      setSuccess(data?.message || "Solicitud enviada, revisa tu correo.");
      setToken(data?.token || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al solicitar recuperación");
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await fetchAPI<{ message: string }>("/v1/auth/password-reset/confirm", {
        method: "POST",
        data: { token, new_password: newPassword },
      });
      if (error) throw new Error(error as string);
      setSuccess(data?.message || "Contraseña actualizada con éxito.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar contraseña");
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>Recuperar Contraseña</Typography>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        {!success ? (
          <Box component="form" onSubmit={handleResetPassword}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              InputProps={{ startAdornment: <Email sx={{ mr: 1 }} /> }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              startIcon={<VpnKey />}
              sx={{ mt: 2, py: 1.5 }}
            >
              Solicitar Recuperación
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleConfirmReset}>
            <TextField
              fullWidth
              label="Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              margin="normal"
              InputProps={{ startAdornment: <VerifiedUser sx={{ mr: 1 }} /> }}
            />
            <TextField
              fullWidth
              label="Nueva Contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              margin="normal"
              InputProps={{ startAdornment: <VpnKey sx={{ mr: 1 }} /> }}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              startIcon={<Lock />}
              sx={{ mt: 2, py: 1.5 }}
            >
              Actualizar Contraseña
            </Button>
          </Box>
        )}
        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          <Link href="/auth/login" style={{ textDecoration: "none" }}>
            <Button color="primary">Volver a Iniciar Sesión</Button>
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
}