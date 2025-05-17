// frontend/src/app/(users)/admin/Sidebar.tsx
import { List, ListItem, ListItemText, ListItemIcon, ListItemButton } from "@mui/material";
import { Home, LockPerson, Security, Link, EmojiEvents, LocalActivity, MonetizationOn, Settings, ShoppingCart } from "@mui/icons-material";

interface SidebarProps {
  onSelect: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onSelect }) => {
  const sections = [
    { name: "Panel", icon: <Home /> },
    { name: "Funcionalidades", icon: <LockPerson /> },
    { name: "Orígenes", icon: <Security /> },
    { name: "Integraciones", icon: <Link /> },
    { name: "Gamificación", icon: <EmojiEvents /> },
    { name: "Cupones", icon: <LocalActivity /> },
    { name: "Pagos", icon: <MonetizationOn /> },
    { name: "Configuraciones", icon: <Settings /> },
    { name: "Marketplace", icon: <ShoppingCart /> },
  ];

  return (
    <List>
      {sections.map((section) => (
        <ListItem key={section.name} disablePadding>
          <ListItemButton onClick={() => onSelect(section.name)}>
            <ListItemIcon>{section.icon}</ListItemIcon>
            <ListItemText primary={section.name} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default Sidebar;