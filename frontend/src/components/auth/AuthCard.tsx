// frontend/src/components/auth/AuthCard.tsx
import { Box, Button, styled } from '@mui/material';

export const AuthGlassCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '24px',
  boxShadow: theme.shadows[10],
  padding: theme.spacing(6),
  width: '100%',
  maxWidth: '500px',
  margin: '0 auto'
}));

export const AuthButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(2),
  fontWeight: 'bold',
  fontSize: '1rem',
  textTransform: 'none',
  marginTop: theme.spacing(2)
}));