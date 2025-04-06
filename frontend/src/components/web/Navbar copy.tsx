// src/components/web/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import Link from "next/link";
import fetchAPI from "@/lib/api";
import {
  Button,
  Avatar,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  styled,
  Box,
  Typography,
  Snackbar,
  Alert,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  MonetizationOn,
  Settings,
  ListAlt,
  People,
  Dashboard,
  Login,
  PersonAdd,
  Person,
  ArrowDropDown,
  Home,
  Star,
  EmojiEvents,
  Leaderboard,
  School,
  Menu as MenuIcon,
} from "@mui/icons-material";

const GlassNavbar = styled("nav")(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1, 2),
  position: "sticky",
  top: 0,
  zIndex: 1000,
}));

const NavContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  maxWidth: "1200px",
  margin: "0 auto",
  [theme.breakpoints.down("md")]: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
}));

const CreditsChip = styled(Chip)(({ theme }) => ({
  background: "rgba(255, 165, 0, 0.2)",
  color: "#FFA500",
  borderColor: "#FFA500",
}));

const PointsChip = styled(Chip)(({ theme }) => ({
  background: "rgba(255, 215, 0, 0.2)",
  color: "#FFD700",
  borderColor: "#FFD700",
}));

const BadgesChip = styled(Chip)(({ theme }) => ({
  background: "rgba(0, 128, 0, 0.2)",
  color: "#008000",
  borderColor: "#008000",
}));

export default function Navbar() {
  const theme = useTheme();
  const { user, credits, gamification, setCredits, setGamification, logout } = useAuth();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [disableCredits, setDisableCredits] = useState(false);
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [enablePoints, setEnablePoints] = useState(true);
  const [enableBadges, setEnableBadges] = useState(true);
  const [enablePaymentMethods, setEnablePaymentMethods] = useState(true);
  const [anonUsername, setAnonUsername] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [newBadge, setNewBadge] = useState<string | null>(null);

  useEffect(() => {
    const storedAnonUsername = localStorage.getItem("anonUsername");
    setAnonUsername(storedAnonUsername);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [
          disableCreditsRes,
          enableRegistrationRes,
          enablePointsRes,
          enableBadgesRes,
          enablePaymentMethodsRes,
        ] = await Promise.all([
          fetchAPI("/v1/settings/disable_credits"),
          fetchAPI("/v1/settings/enable_registration"),
          fetchAPI("/v1/settings/enable_points"),
          fetchAPI("/v1/settings/enable_badges"),
          fetchAPI("/v1/settings/enable_payment_methods"),
        ]);
        setDisableCredits(disableCreditsRes.data === "true" || disableCreditsRes.data === true);
        setEnableRegistration(enableRegistrationRes.data === "true" || enableRegistrationRes.data === true);
        setEnablePoints(enablePointsRes.data === "true" || enablePointsRes.data === true);
        setEnableBadges(enableBadgesRes.data === "true" || enableBadgesRes.data === true);
        setEnablePaymentMethods(enablePaymentMethodsRes.data === "true" || enablePaymentMethodsRes.data === true);
      } catch (err) {
        console.error("Error al obtener configuraciones:", err);
      }
    };
    fetchSettings();
  }, []);

  interface InfoData {
    credits: number;
  }

  useEffect(() => {
    if (!enablePoints && !enableBadges) return;

    const interval = setInterval(async () => {
      try {
        const { data: infoData } = await fetchAPI<InfoData>("/info");
        if (infoData) {
          setCredits(infoData.credits);
        }

        const { data: gamificationData } = await fetchAPI("/v1/gamification/me");
        if (gamificationData && Array.isArray(gamificationData)) {
          const totalPoints = enablePoints
            ? gamificationData.reduce((sum, g) => sum + g.points, 0)
            : 0;
          const badges = enableBadges
            ? gamificationData.map((g) => g.badge).filter((b) => b !== null)
            : [];

          const previousBadges = JSON.parse(localStorage.getItem("badges") || "[]");
          const currentBadgeIds = badges.map((b) => b.id);
          const newBadges = currentBadgeIds.filter((id) => !previousBadges.includes(id));
          if (newBadges.length > 0 && enableBadges) {
            const badge = badges.find((b) => b.id === newBadges[0]);
            setNewBadge(badge?.name || "Nuevo badge");
            setSnackbarOpen(true);
            localStorage.setItem("badges", JSON.stringify(currentBadgeIds));
          }

          setGamification({ points: totalPoints, badges });
        }
      } catch (err) {
        console.error("Error al actualizar datos:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [setCredits, setGamification, enablePoints, enableBadges]);

  const handleSettingsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleDrawerOpen = () => {
    setDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
  };

  return (
    <GlassNavbar>
      <NavContainer>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            onClick={handleDrawerOpen}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Link href="/" passHref>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}>
              <Home color="primary" />
              <Typography
                variant="h6"
                component="span"
                sx={{
                  fontWeight: "bold",
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Neptuno
              </Typography>
            </Box>
          </Link>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 2 }}>
          {!disableCredits && credits > 0 && (
            <Link href="/user/transactions" passHref>
              <CreditsChip icon={<MonetizationOn />} label={credits} variant="outlined" clickable />
            </Link>
          )}

          {gamification && (
            <>
              {enablePoints && (
                <Link href="/user/points" passHref>
                  <PointsChip icon={<Star />} label={gamification.points} variant="outlined" clickable />
                </Link>
              )}
              {enableBadges && (
                <Link href="/user/badges" passHref>
                  <BadgesChip icon={<EmojiEvents />} label={gamification.badges.length} variant="outlined" clickable />
                </Link>
              )}
            </>
          )}

          {user?.rol === "admin" && (
            <>
              <IconButton
                onClick={handleSettingsMenuOpen}
                sx={{ color: "inherit", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" } }}
              >
                <Settings />
              </IconButton>
              <Menu
                anchorEl={settingsAnchorEl}
                open={Boolean(settingsAnchorEl)}
                onClose={handleSettingsMenuClose}
                PaperProps={{
                  sx: {
                    background: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    mt: 1,
                    minWidth: "200px",
                  },
                }}
              >
                <MenuItem onClick={handleSettingsMenuClose} component={Link} href="/admin/dashboard">
                  <Dashboard sx={{ mr: 1 }} /> Dashboard
                </MenuItem>
                <MenuItem onClick={handleSettingsMenuClose} component={Link} href="/admin/registry">
                  <ListAlt sx={{ mr: 1 }} /> Registros
                </MenuItem>
                <MenuItem onClick={handleSettingsMenuClose} component={Link} href="/admin/users">
                  <People sx={{ mr: 1 }} /> Usuarios
                </MenuItem>
                <MenuItem onClick={handleSettingsMenuClose} component={Link} href="/rankings">
                  <Leaderboard sx={{ mr: 1 }} /> Rankings
                </MenuItem>
                <MenuItem onClick={handleSettingsMenuClose} component={Link} href="/ejemplos">
                  <School sx={{ mr: 1 }} /> Ejemplos
                </MenuItem>
              </Menu>
            </>
          )}

          {user ? (
            <Button
              component={Link}
              href="/user/dashboard"
              startIcon={<Person />}
              endIcon={<ArrowDropDown />}
              sx={{ color: "inherit", textTransform: "none", fontWeight: "medium" }}
            >
              {user.username}
            </Button>
          ) : anonUsername ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                avatar={<Avatar sx={{ width: 24, height: 24 }}><Person sx={{ fontSize: 14 }} /></Avatar>}
                label={anonUsername}
                variant="outlined"
              />
              <Button
                component={Link}
                href="/user/auth/#login"
                variant="contained"
                color="secondary"
                startIcon={<Login />}
                sx={{ borderRadius: "12px" }}
              >
                ¡Empezar!
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button component={Link} href="/user/auth/#login" startIcon={<Login />} sx={{ borderRadius: "12px" }}>
                Iniciar Sesión
              </Button>
              {enableRegistration && (
                <Button
                  component={Link}
                  href="/user/auth/#register"
                  variant="contained"
                  color="primary"
                  startIcon={<PersonAdd />}
                  sx={{ borderRadius: "12px" }}
                >
                  Registrarse
                </Button>
              )}
            </Box>
          )}
        </Box>

        <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerClose}>
          <List>
            <ListItem component={Link} href="/">
              <ListItemIcon><Home /></ListItemIcon>
              <ListItemText primary="Inicio" />
            </ListItem>
            {user?.rol === "admin" && (
              <>
                <ListItem component={Link} href="/admin/dashboard">
                  <ListItemIcon><Dashboard /></ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItem>
                <ListItem component={Link} href="/admin/registry">
                  <ListItemIcon><ListAlt /></ListItemIcon>
                  <ListItemText primary="Registros" />
                </ListItem>
                <ListItem component={Link} href="/admin/users">
                  <ListItemIcon><People /></ListItemIcon>
                  <ListItemText primary="Usuarios" />
                </ListItem>
                <ListItem component={Link} href="/rankings">
                  <ListItemIcon><Leaderboard /></ListItemIcon>
                  <ListItemText primary="Rankings" />
                </ListItem>
                <ListItem component={Link} href="/ejemplos">
                  <ListItemIcon><School /></ListItemIcon>
                  <ListItemText primary="Ejemplos" />
                </ListItem>
              </>
            )}
            {user ? (
              <ListItem component={Link} href="/user/dashboard">
                <ListItemIcon><Person /></ListItemIcon>
                <ListItemText primary={user.username} />
              </ListItem>
            ) : (
              <>
                <ListItem component={Link} href="/user/auth/#login">
                  <ListItemIcon><Login /></ListItemIcon>
                  <ListItemText primary="Iniciar Sesión" />
                </ListItem>
                {enableRegistration && (
                  <ListItem component={Link} href="/user/auth/#register">
                    <ListItemIcon><PersonAdd /></ListItemIcon>
                    <ListItemText primary="Registrarse" />
                  </ListItem>
                )}
              </>
            )}
          </List>
        </Drawer>
      </NavContainer>

      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={() => setSnackbarOpen(false)}>
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: "100%" }}>
          ¡Felicidades! Has obtenido el badge: {newBadge}
        </Alert>
      </Snackbar>
    </GlassNavbar>
  );
}