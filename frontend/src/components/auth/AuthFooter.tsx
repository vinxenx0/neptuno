// frontend/src/components/auth/AuthFooter.tsx
import { Box, Typography } from '@mui/material';

export default function AuthFooter() {
  return (
    <Box component="footer" sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Neptuno. Todos los derechos reservados.
      </Typography>
    </Box>
  );
}