
// from frontend/src/components/ui/FeatureStateHandler.tsx
// This component handles the display of a feature based on its enabled state.
// It shows a loading spinner while checking the state and displays a message if the feature is disabled.
// If the feature is enabled, it renders the children components passed to it.
// It uses Material-UI for styling and layout.
// The component is designed to be reusable and can be used in various parts of the application where feature state handling is required.
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