import React, { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface FeatureDisabledProps {
  message: string;
  isEnabled: boolean | null;
  children?: ReactNode;
}

const FeatureDisabled: React.FC<FeatureDisabledProps> = ({ message, isEnabled, children }) => {
  if (isEnabled === null) return null;

  if (!isEnabled) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          {message}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
};

export default FeatureDisabled;