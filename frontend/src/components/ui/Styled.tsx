// frontend/src/components/ui/Styled.tsx
// This file contains styled components for the application using Material-UI's styled API.
// It includes custom styles for tabs, chips, cards, and other UI elements.
// The styles are defined using the theme provided by Material-UI, allowing for consistent theming across the application.
import { styled } from '@mui/material/styles';
import { Chip, Tabs, Paper, Card } from '@mui/material';

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: '2px',
  },
  '& .MuiTab-root': {
    color: theme.palette.text.primary,
    opacity: 0.8,
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'capitalize',
    padding: '12px 16px',
    minHeight: 'auto',
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      opacity: 1,
      fontWeight: 600,
    },
    '&:hover': {
      opacity: 1,
      color: theme.palette.primary.dark,
    },
  },
}));

export const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: '8px',
  fontWeight: 600,
  fontSize: '0.75rem',
  padding: '2px 8px',
  height: 'auto',
  color: 'white',
  '&.MuiChip-colorSuccess': {
    backgroundColor: theme.palette.success.main,
  },
  '&.MuiChip-colorWarning': {
    backgroundColor: theme.palette.warning.main,
  },
  '&.MuiChip-colorError': {
    backgroundColor: theme.palette.error.main,
  },
  '&.MuiChip-colorDefault': {
    backgroundColor: theme.palette.grey[500],
  },
}));

export const StyledCard = styled(Paper)(({ theme }) => ({
  background: 'rgba(248, 249, 250, 0.85)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: theme.spacing(3),
  boxShadow: theme.shadows[4],
  border: '1px solid rgba(222, 226, 230, 0.5)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[6],
    background: 'rgba(248, 249, 250, 0.95)',
  },
}));

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