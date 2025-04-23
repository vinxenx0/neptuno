import { Box, Card, CardContent, Typography, styled } from "@mui/material";
import { ReactNode } from "react";

interface MinimalCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  gradient?: boolean;
}

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
}));

export default function MinimalCard({ title, value, icon, gradient }: MinimalCardProps) {
  const Component = gradient ? GradientCard : StyledCard;
  
  return (
    <Component>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
        <Box sx={{ 
          p: 1.5, 
          bgcolor: gradient ? 'rgba(255,255,255,0.15)' : 'action.hover',
          borderRadius: 1,
          display: 'flex',
        }}>
          {icon}
        </Box>
        <div>
          <Typography variant="body2" color={gradient ? 'text.secondary' : 'text.primary'}>
            {title}
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {value}
          </Typography>
        </div>
      </CardContent>
    </Component>
  );
}