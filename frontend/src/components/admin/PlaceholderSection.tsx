import { Box, Typography } from "@mui/material";

interface PlaceholderSectionProps {
  title: string;
}

export default function PlaceholderSection({ title }: PlaceholderSectionProps) {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4">{title}</Typography>
      <Typography>Contenido por implementar</Typography>
    </Box>
  );
}