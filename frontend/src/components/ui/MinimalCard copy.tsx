// frontend/src/components/ui/MinimalCard.tsx
import { Card, CardContent, Typography } from "@mui/material";
import { ReactNode } from "react";

interface MinimalCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
}

export default function MinimalCard({ title, value, icon }: MinimalCardProps) {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 1, bgcolor: "white" }}>
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 2 }}>
        {icon}
        <div>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {value}
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
}