// frontend/src/app/(auth)/auth/register/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import fetchAPI from "@/lib/api";
import { TextField, Alert, Button, Box, Typography, FormControlLabel, Checkbox } from "@mui/material";
import { Person, Email, VpnKey, PersonAdd, Google, Facebook } from "@mui/icons-material";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enableRegistration, setEnableRegistration] = useState(true);
  const { register } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await fetchAPI("/v1/settings/enable_registration");
      setEnableRegistration(data === "true" || data === true);
    };
    fetchSettings();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!enableRegistration || !termsAccepted) return;
    try {
      await register({ email, username, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse");
    }
  };

  return (
    <AuthLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600 }}>Crear Cuenta</Typography>
        {!enableRegistration && <Alert severity="warning" sx={{ mb: 3 }}>El registro está deshabilitado.</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleRegister}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            disabled={!enableRegistration}
            InputProps={{ startAdornment: <Email sx={{ mr: 1 }} /> }}
          />
          <TextField
            fullWidth
            label="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            disabled={!enableRegistration}
            InputProps={{ startAdornment: <Person sx={{ mr: 1 }} /> }}
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            disabled={!enableRegistration}
            InputProps={{ startAdornment: <VpnKey sx={{ mr: 1 }} /> }}
          />
          <FormControlLabel
            control={<Checkbox checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />}
            label={<Typography>Acepto los <Link href="/terms">Términos y Condiciones</Link></Typography>}
            sx={{ mt: 2 }}
          />
          <Button
            fullWidth
            type="submit"
            variant="contained"
            startIcon={<PersonAdd />}
            disabled={!enableRegistration || !termsAccepted}
            sx={{ mt: 2, py: 1.5 }}
          >
            Registrarse
          </Button>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Google />}
            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/register/google`}
            sx={{ mb: 1 }}
          >
            Registrarse con Google
          </Button>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Facebook />}
            onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/register/meta`}
          >
            Registrarse con Meta
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          ¿Ya tienes una cuenta?{" "}
          <Link href="/auth/login" style={{ textDecoration: "none" }}>
            <Button color="primary">Inicia sesión</Button>
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
}