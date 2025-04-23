// frontend/src/components/ui/Notification.tsx
import { Snackbar, Alert } from "@mui/material";

interface NotificationProps {
  message: string;
  severity: "success" | "error";
  onClose: () => void;
}

export default function Notification({ message, severity, onClose }: NotificationProps) {
  return (
    <Snackbar open autoHideDuration={3000} onClose={onClose} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
      <Alert severity={severity} onClose={onClose} sx={{ boxShadow: 1, borderRadius: 2 }}>
        {message}
      </Alert>
    </Snackbar>
  );
}