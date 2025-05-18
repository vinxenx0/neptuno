// frontend/src/app/(users)/admin/Sidebar.tsx
import { List, ListItem, ListItemText, ListItemIcon, ListItemButton, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useState } from "react";

interface SidebarItem {
  name: string;
  icon: React.ReactNode;
  suboptions?: { name: string; icon: React.ReactNode }[];
}

interface SidebarProps {
  items: SidebarItem[];
  onSelect: (section: string) => void;
  selectedSection: string;
}

export default function Sidebar({ items, onSelect, selectedSection }: SidebarProps) {
  const [expanded, setExpanded] = useState<string[]>([]);

  const handleToggleExpand = (name: string) => {
    setExpanded((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  return (
    <List>
      {items.map((item) => (
        <div key={item.name}>
          <ListItemButton
            onClick={() => {
              if (item.suboptions) {
                handleToggleExpand(item.name);
              }
              onSelect(item.name);
            }}
            selected={selectedSection === item.name}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
            {item.suboptions && (expanded.includes(item.name) ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
          {item.suboptions && (
            <Collapse in={expanded.includes(item.name)} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {item.suboptions.map((sub) => (
                  <ListItemButton
                    key={sub.name}
                    sx={{ pl: 4 }}
                    onClick={() => onSelect(`${item.name} - ${sub.name}`)}
                    selected={selectedSection === `${item.name} - ${sub.name}`}
                  >
                    <ListItemIcon>{sub.icon}</ListItemIcon>
                    <ListItemText primary={sub.name} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          )}
        </div>
      ))}
    </List>
  );
}