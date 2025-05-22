// frontend/src/app/(auth)/auth/register/page.tsx
// src/app/(auth)/auth/register/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import fetchAPI from '@/lib/api';
import { TextField, Alert, Chip, Typography, Box, Button } from '@mui/material';
import { Person, Email, VpnKey, PersonAdd, Stars } from '@mui/icons-material';
import Link from 'next/link';
import { AuthGlassCard, AuthButton } from '../../../../components/auth/AuthCard';
import AuthFormContainer from '../../../../components/auth/AuthFormContainer';
import BackButton from '../../../../components/auth/BackButton';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [enableRegistration, setEnableRegistration] = useState(true);
  const { register } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const enableRegistrationRes = await fetchAPI('/v1/settings/enable_registration');
        setEnableRegistration(enableRegistrationRes.data === 'true' || enableRegistrationRes.data === true);
      } catch (err) {
        console.error('Error al obtener configuraciones:', err);
        setEnableRegistration(true);
      }
    };
    fetchSettings();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!enableRegistration) return;
    
    try {
      await register({ email, username, password });

      try {
        await Promise.all([
          fetchAPI('/v1/gamification/events', { 
            method: 'POST',
            data: { event_type_id: 101 }
          }),
          fetchAPI('/v1/gamification/events', { 
            method: 'POST',
            data: { event_type_id: 102 }
          }),
          fetchAPI('/v1/gamification/events', { 
            method: 'POST',
            data: { event_type_id: 103 }
          })
        ]);
        
        await fetchAPI('/v1/gamification/events', { 
          method: 'POST',
          data: { event_type_id: 104 }
        });
        
        setSuccess('¡Registro exitoso! 🏆 ¡Insignia obtenida! Redirigiendo...');
      } catch (gamErr) {
        setSuccess('¡Registro exitoso! Redirigiendo...');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
      if (errorMessage.includes('email')) {
        setError('El email ya está registrado');
      } else if (errorMessage.includes('username')) {
        setError('El nombre de usuario ya está en uso');
      } else {
        setError(errorMessage);
      }
    }
  };

  

  return (
    <AuthGlassCard>
      <AuthFormContainer
        title="Crear Cuenta"
        initial={{ x: 100, opacity: 0 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <BackButton href="/auth/login" />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Crear Cuenta
          </Typography>
        </Box>

        {!enableRegistration && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
            El registro está deshabilitado en este momento.
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>{success}</Alert>}

        <Box sx={{ textAlign: 'center', mt: 2, mb: 3 }}>
          <Chip 
            icon={<Stars />}
            label="¡Gana 3 puntos + insignia al registrarte!"
            color="secondary"
            variant="outlined"
          />
        </Box>

        <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            disabled={!enableRegistration}
            InputProps={{ startAdornment: <Email color="action" sx={{ mr: 1 }} /> }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Nombre de usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
            disabled={!enableRegistration}
            InputProps={{ startAdornment: <Person color="action" sx={{ mr: 1 }} /> }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            disabled={!enableRegistration}
            InputProps={{ startAdornment: <VpnKey color="action" sx={{ mr: 1 }} /> }}
            sx={{ mb: 2 }}
          />
          <AuthButton
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={!enableRegistration}
            startIcon={<PersonAdd />}
          >
            Registrarse
          </AuthButton>
        </Box>

        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
          ¿Ya tienes una cuenta?{' '}
          <Button component={Link} href="/auth/login" color="primary">
            Inicia sesión
          </Button>
        </Typography>
      </AuthFormContainer>
    </AuthGlassCard>
  );
}