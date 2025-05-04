// src/app/(auth)/auth/components/AuthFormContainer.tsx
// src/app/(auth)/auth/components/AuthFormContainer.tsx
import { Box, Typography } from '@mui/material';
import { motion, Variant, Variants } from 'framer-motion';
import { ReactNode } from 'react';

interface AuthFormContainerProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon?: ReactNode;
  initial?: boolean | import('framer-motion').TargetAndTransition | import('framer-motion').VariantLabels;
  animate?: boolean | import('framer-motion').TargetAndTransition | import('framer-motion').VariantLabels;
  transition?: { duration: number };
}

export default function AuthFormContainer({
  children,
  title,
  description = '',
  icon,
  initial = { opacity: 0 },
  animate = { opacity: 1 },
  transition = { duration: 0.3 }
}: AuthFormContainerProps) {
  return (
    <motion.div 
      initial={initial}
      animate={animate}
      transition={transition}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        {icon}
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body1" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      {children}
    </motion.div>
  );
}