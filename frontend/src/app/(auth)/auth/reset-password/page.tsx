// frontend/src/app/(auth)/auth/reset-password/page.tsx
// src/app/(auth)/auth/reset-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import fetchAPI from '@/lib/api';
import { TextField, Alert, Typography, Button, Box } from '@mui/material';
import { Email, VpnKey, VerifiedUser, Lock } from '@mui/icons-material';
import { AuthGlassCard, AuthButton } from '../../../../components/auth/AuthCard';
import AuthFormContainer from '../../../../components/auth/AuthFormContainer';
import BackButton from '../../../../components/auth/BackButton';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await fetchAPI<{ message: string; token?: string }>('/v1/auth/password-reset', {
        method: 'POST',
        data: { email },
      });
      if (error) throw new Error(error as string);
      setSuccess(data?.message || 'Solicitud enviada, revisa tu correo.');
      setToken(data?.token || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al solicitar recuperación');
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await fetchAPI<{ message: string }>('/v1/auth/password-reset/confirm', {
        method: 'POST',
        data: { token, new_password: newPassword },
      });
      if (error) throw new Error(error as string);
      setSuccess(data?.message || 'Contraseña actualizada con éxito.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar contraseña');
    }
  };

  return (
    <AuthGlassCard>
      <AuthFormContainer
        title="Recuperar Contraseña"
        initial={{ y: 100, opacity: 0 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <BackButton href="/auth/login" />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Recuperar Contraseña
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

        {!success ? (
          <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 2 }}>
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
            <AuthButton
              fullWidth
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              startIcon={<VpnKey />}
            >
              Solicitar Recuperación
            </AuthButton>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleConfirmReset} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              margin="normal"
              InputProps={{ startAdornment: <VerifiedUser color="action" sx={{ mr: 1 }} /> }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Nueva Contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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
              Actualizar Contraseña
            </AuthButton>
          </Box>
        )}

        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
          <Button component={Link} href="/auth/login" color="primary">
            Volver a Iniciar Sesión
          </Button>
        </Typography>
      </AuthFormContainer>
    </AuthGlassCard>
  );
}