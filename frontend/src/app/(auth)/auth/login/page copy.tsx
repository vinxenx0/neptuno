// frontend/src/app/(auth)/auth/login/page.tsx
// src/app/(auth)/auth/login/page.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import fetchAPI from '@/lib/api';
import { TextField, Alert, Divider, Chip, Button, Box } from '@mui/material';
import { Lock, Email, VpnKey, EmojiEvents } from '@mui/icons-material';
import Link from 'next/link';
import { AuthGlassCard, AuthButton } from '../../../../components/auth/AuthCard';
import AuthFormContainer from '../../../../components/auth/AuthFormContainer';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await login(email, password);
      
      try {
        await fetchAPI('/v1/gamification/events', {
          method: 'POST',
          data: { event_type_id: 100 }
        });
        setSuccess('¡Inicio de sesión exitoso! Redirigiendo... (+1 punto 🎉)');
      } catch (gamErr) {
        setSuccess('¡Inicio de sesión exitoso! Redirigiendo...');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    }
  };

  return (
    <AuthGlassCard>
      <AuthFormContainer
        title="Iniciar Sesión"
        description="Accede a tu cuenta para continuar"
        icon={<Lock color="primary" sx={{ fontSize: 48, mb: 2 }} />}
      >
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

        <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            InputProps={{ startAdornment: <Email color="action" sx={{ mr: 1 }} /> }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            InputProps={{ startAdornment: <VpnKey color="action" sx={{ mr: 1 }} /> }}
            sx={{ mb: 2 }}
          />
          <AuthButton
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Lock />}
          >
            Iniciar Sesión
          </AuthButton>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Chip 
            icon={<EmojiEvents />}
            label="+1 punto por cada login"
            color="warning"
            variant="outlined"
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button component={Link} href="/auth/register" color="secondary">
            Crear una cuenta
          </Button>
          <Button component={Link} href="/auth/reset-password" color="inherit">
            ¿Olvidaste tu contraseña?
          </Button>
        </Box>
      </AuthFormContainer>
    </AuthGlassCard>
  );
}