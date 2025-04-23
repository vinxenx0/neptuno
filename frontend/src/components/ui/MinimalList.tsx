
// file: frontend/src/components/ui/MinimalList.tsx
import { List, ListItem, ListItemText } from "@mui/material";

interface MinimalListProps {
  items: { primary: string; secondary?: string }[];
}

export default function MinimalList({ items }: MinimalListProps) {
  return (
    <List sx={{ bgcolor: "white", borderRadius: 2, boxShadow: 1 }}>
      {items.map((item, index) => (
        <ListItem key={index} divider={index < items.length - 1}>
          <ListItemText primary={item.primary} secondary={item.secondary} />
        </ListItem>
      ))}
    </List>
  );
}