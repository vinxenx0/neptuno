import { useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export function useNotifications() {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, severity: Notification['severity']) => {
    setNotification({ message, severity });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  const NotificationComponent = () => (
    <AnimatePresence>
      {notification && (
        <Snackbar
          open
          autoHideDuration={3000}
          onClose={clearNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Alert
              severity={notification.severity}
              onClose={clearNotification}
              sx={{ boxShadow: 6, borderRadius: '12px' }}
            >
              {notification.message}
            </Alert>
          </motion.div>
        </Snackbar>
      )}
    </AnimatePresence>
  );

  return { showNotification, NotificationComponent };
}