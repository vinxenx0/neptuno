// frontend/src/components/ui/MinimalForm.tsx
import { Box, Button } from "@mui/material";
import { ReactNode } from "react";

interface MinimalFormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: ReactNode;
  submitLabel?: string;
}

export default function MinimalForm({ onSubmit, children, submitLabel = "Guardar" }: MinimalFormProps) {
  return (
    <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {children}
      <Button type="submit" variant="contained" color="primary" sx={{ alignSelf: "flex-start" }}>
        {submitLabel}
      </Button>
    </Box>
  );
}