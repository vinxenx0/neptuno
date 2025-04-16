// Componentes de UI reutilizables para dashboards
import { Card, styled } from "@mui/material";

export const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)`,
  color: 'white',
  borderRadius: '16px',
  boxShadow: theme.shadows[4]
}));

export const GlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(248, 249, 250, 0.8)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(222, 226, 230, 0.5)',
  borderRadius: '16px',
  boxShadow: theme.shadows[2]
}));

export const AdminGradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: '16px',
  boxShadow: theme.shadows[10],
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)'
  }
}));

export const ConfigGlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  boxShadow: theme.shadows[5]
}));

export const FeatureCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: theme.shadows[4],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8]
  }
}));
