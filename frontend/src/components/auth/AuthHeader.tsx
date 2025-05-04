// frontend/src/components/auth/AuthHeader.tsx
import { Box, Typography, Avatar } from '@mui/material';
import Link from 'next/link';
import { VerifiedUser } from '@mui/icons-material';

export default function AuthHeader() {
  return (
    <Box component="header" sx={{ p: 4, textAlign: 'center' }}>
      <Link href="/" passHref>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <VerifiedUser />
          </Avatar>
          <Typography 
            variant="h4" 
            component="span" 
            sx={{ 
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, primary.main 30%, secondary.main 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Neptuno
          </Typography>
        </Box>
      </Link>
    </Box>
  );
}