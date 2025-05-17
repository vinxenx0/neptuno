import { Box } from "@mui/material";
import Sidebar from "./Sidebar";
import { useState } from "react";

interface DashboardLayoutProps {
  children: (section: string) => React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [activeSection, setActiveSection] = useState("Inicio");

  return (
    <Box sx={{ display: "flex", minHeight: "calc(100vh - 80px)" }}>
      <Box sx={{ width: "250px", bgcolor: "background.paper", boxShadow: 2 }}>
        <Sidebar onSelect={setActiveSection} />
      </Box>
      <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto" }}>
        {children(activeSection)}
      </Box>
    </Box>
  );
};

export default DashboardLayout;