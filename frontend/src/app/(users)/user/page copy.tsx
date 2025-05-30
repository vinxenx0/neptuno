// frontend/src/app/%28users%29/user/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
} from "@mui/material";
import { Menu as MenuIcon, Home, Shield as ShieldCheckIcon } from "@mui/icons-material";
import {
  Person,
  Security,
  LocalActivity,
  History,
  Payment,
  CreditCard,
  Link,
  ShoppingCart,
  Logout,
  Delete,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import ProfileSection from "@/components/user/ProfileSection";
import SecuritySection from "@/components/user/SecuritySection";
import CouponsSection from "@/components/user/CouponsSection";
import TransactionsSection from "@/components/user/TransactionsSection";
import PaymentMethodsSection from "@/components/user/PaymentMethodsSection";
import BuyCreditsSection from "@/components/user/BuyCreditsSection";
import IntegrationsSection from "@/components/user/IntegrationsSection";
import OrdersSection from "@/components/user/OrdersSection";
import HomeSection from "@/components/user/HomeSection";
import PrivacySection from "@/components/user/PrivacySection"; 
import fetchAPI from "@/lib/api";
import {
  Integration,
  Order,
  Coupon,
  CreditTransaction,
  PaymentMethod,
  PaymentProvider,
} from "@/lib/types";

// Styled Components
export const GradientCard = styled("div")(({ theme }) => ({
  background: `linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)`,
  color: "white",
  borderRadius: "16px",
  boxShadow: theme.shadows[4],
}));

export const GlassCard = styled("div")(({ theme }) => ({
  background: "rgba(248, 249, 250, 0.8)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(222, 226, 230, 0.5)",
  borderRadius: "16px",
  boxShadow: theme.shadows[2],
}));

export default function UserDashboard() {
  const { user, logout, updateProfile, coupons, setCoupons } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("Inicio");
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [paymentProviders, setPaymentProviders] = useState<PaymentProvider[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const drawerWidth = 240;

  // Fetch initial data
  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }
    const fetchData = async () => {
      try {
        const [transRes, methRes, providersRes, integrationsRes, ordersRes, couponsRes] = await Promise.all([
          fetchAPI<CreditTransaction[]>("/v1/payments/transactions"),
          fetchAPI<PaymentMethod[]>("/v1/payments/methods"),
          fetchAPI<PaymentProvider[]>("/v1/payment-providers"),
          fetchAPI<Integration[]>("/v1/integrations/"),
          fetchAPI<Order[]>("/v1/marketplace/orders"),
          fetchAPI<Coupon[]>("/v1/coupons/me"),
        ]);
        setTransactions(transRes.data || []);
        setMethods(methRes.data || []);
        setPaymentProviders(providersRes.data?.filter((p) => p.active) || []);
        setIntegrations(integrationsRes.data || []);
        setOrders(ordersRes.data || []);
        setCoupons(couponsRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [user, router, setCoupons]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleSectionSelect = (section: string) => {
    setSelectedSection(section);
    if (isMobile) setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const handleDeleteAccount = async () => {
    if (confirm("¿Estás seguro de eliminar tu cuenta? Esta acción es irreversible.")) {
      try {
        await fetchAPI("/v1/users/me", { method: "DELETE" });
        await logout();
        router.push("/auth/login");
      } catch (err) {
        console.error("Error deleting account:", err);
      }
    }
  };

  // Updated sections array with Privacy Center
  const sections = [
    { name: "Inicio", icon: <Home /> },
    { name: "Profile", icon: <Person /> },
    { name: "Security", icon: <Security /> },
    { name: "Coupons", icon: <LocalActivity /> },
    { name: "Transactions", icon: <History /> },
    { name: "Payment Methods", icon: <Payment /> },
    { name: "Buy Credits", icon: <CreditCard /> },
    { name: "Integrations", icon: <Link /> },
    { name: "Orders", icon: <ShoppingCart /> },
    { name: "Privacy Center", icon: <ShieldCheckIcon /> }, // New section
  ];

  const drawer = (
    <Box sx={{ width: drawerWidth, bgcolor: "background.paper", height: "100%" }}>
      <Toolbar>
        <Typography variant="h6">Mi Cuenta</Typography>
      </Toolbar>
      <List>
        {sections.map((section) => (
          <ListItem key={section.name} disablePadding>
            <ListItemButton
              selected={selectedSection === section.name}
              onClick={() => handleSectionSelect(section.name)}
            >
              <ListItemIcon>{section.icon}</ListItemIcon>
              <ListItemText primary={section.name} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><Logout /></ListItemIcon>
            <ListItemText primary="Cerrar Sesión" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={handleDeleteAccount}>
            <ListItemIcon><Delete /></ListItemIcon>
            <ListItemText primary="Eliminar Cuenta" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  if (!user) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h6" color="textSecondary">
            Cargando tu perfil...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        display: "flex",
      }}
    >
      {/* AppBar for mobile */}
      <AppBar
        position="fixed"
        sx={{ zIndex: theme.zIndex.drawer + 1, display: { md: "none" } }}
      >
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">Panel de Usuario</Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: 8, md: 0 },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
          }}
        >
          <Typography variant="h3">Hola, {user.username}!</Typography>
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            {user.username.charAt(0).toUpperCase()}
          </Avatar>
        </Box>

        {/* Render Selected Section */}
        {selectedSection === "Inicio" && (
          <HomeSection
            user={user}
            transactions={transactions}
            methods={methods}
            orders={orders}
            setSelectedSection={setSelectedSection}
          />
        )}
        {selectedSection === "Profile" && (
          <ProfileSection user={user} updateProfile={updateProfile} />
        )}
        {selectedSection === "Security" && <SecuritySection />}
        {selectedSection === "Coupons" && (
          <CouponsSection
            coupons={coupons}
            setCoupons={setCoupons}
            setCredits={(credits) => (user.credits = credits)}
          />
        )}
        {selectedSection === "Transactions" && (
          <TransactionsSection transactions={transactions} orders={orders} />
        )}
        {selectedSection === "Payment Methods" && (
          <PaymentMethodsSection
            methods={methods}
            setMethods={setMethods}
            paymentProviders={paymentProviders}
          />
        )}
        {selectedSection === "Buy Credits" && (
          <BuyCreditsSection
            methods={methods}
            setTransactions={setTransactions}
          />
        )}
        {selectedSection === "Integrations" && (
          <IntegrationsSection
            integrations={integrations}
            setIntegrations={setIntegrations}
          />
        )}
        {selectedSection === "Orders" && <OrdersSection orders={orders} />}
        {selectedSection === "Privacy Center" && <PrivacySection onDeleteAccount={handleDeleteAccount} />}
      </Box>
    </Box>
  );
}