import React, { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface FeatureStateHandlerProps {
  isEnabled: boolean | null;
  message: string;
  children?: ReactNode;
}

const FeatureStateHandler: React.FC<FeatureStateHandlerProps> = ({ isEnabled, message, children }) => {
  if (isEnabled === null) return null;

  if (!isEnabled) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
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

export default FeatureStateHandler;