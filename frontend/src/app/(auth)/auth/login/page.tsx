// frontend/src/app/(auth)/auth/login/page.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { TextField, Alert, Button, Box, Typography } from "@mui/material";
import { Lock, Email, VpnKey, Google, Facebook } from "@mui/icons-material";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    }
  };

  const handleGoogleLogin = () => {
  window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login/google`;
};

  return (
    <AuthLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>Iniciar Sesión</Typography>
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleLogin}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            InputProps={{ startAdornment: <Email sx={{ mr: 1 }} /> }}
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            Iniciar Sesión
          </Button>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Google />}
            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login/google`}
            sx={{ mb: 1 }}
          >
            Iniciar sesión con Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Facebook />}
            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login/meta`}
          >
            Iniciar sesión con Meta
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          Al usar Neptuno, aceptas nuestros <Link href="/terms">Términos y Condiciones</Link>.
        </Typography>
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Link href="/auth/register" style={{ textDecoration: "none" }}>
            <Button color="secondary">Crear una cuenta</Button>
          </Link>
          <Link href="/auth/reset-password" style={{ textDecoration: "none" }}>
            <Button color="inherit">¿Olvidaste tu contraseña?</Button>
          </Link>
        </Box>
      </Box>
    </AuthLayout>
  );
}