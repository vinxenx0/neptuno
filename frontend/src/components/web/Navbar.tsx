// frontend/src/components/web/Navbar.tsx
// Barra de navegación principal con estado de usuario y notificaciones
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import Link from "next/link";
import { usePathname } from "next/navigation";
import fetchAPI from "@/lib/api";
import StoreIcon from "@mui/icons-material/Store";
import {
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
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
  Tooltip,
  Badge,
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
  Home,
  Star,
  EmojiEvents,
  Leaderboard,
  School,
  Menu as MenuIcon,
  ContactMail,
  Close,
  Key,
  LocalActivity,
  Mail,
  Favorite,
} from "@mui/icons-material";
import Image from "next/image";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { CartItem } from "@/lib/types";

const MobileBottomNav = styled(Box)(({ theme }) => ({
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1),
  zIndex: 999,
  justifyContent: "space-around",
  alignItems: "center",
  display: "flex",
  [theme.breakpoints.up("md")]: {
    display: "none",
  },
}));

const GlassNavbar = styled("nav")(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.1)",
  backdropFilter: "blur(10px)",
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1, 2),
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
}));

const NavContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  maxWidth: "1200px",
  margin: "0 auto",
  [theme.breakpoints.down("md")]: {
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
}));

export default function Navbar() {
  const theme = useTheme();
  const pathname = usePathname();
  const {
    user,
    credits,
    gamification,
    coupons,
    setCredits,
    setGamification,
    logout,
  } = useAuth();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [disableCredits, setDisableCredits] = useState(false);
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [enablePoints, setEnablePoints] = useState(true);
  const [enableCoupons, setEnableCoupons] = useState(true);
  const [enableBadges, setEnableBadges] = useState(true);
  const [enablePaymentMethods, setEnablePaymentMethods] = useState(true);
  const [anonUsername, setAnonUsername] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      const { data } = await fetchAPI<CartItem[]>("/v1/marketplace/cart");
      setCartItemsCount(data?.length || 0);
    };
    fetchCartCount();
  }, []);

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
          enableCouponsRes,
          enableBadgesRes,
          enablePaymentMethodsRes,
        ] = await Promise.all([
          fetchAPI("/v1/settings/disable_credits"),
          fetchAPI("/v1/settings/enable_registration"),
          fetchAPI("/v1/settings/enable_points"),
          fetchAPI("/v1/settings/enable_coupons"),
          fetchAPI("/v1/settings/enable_badges"),
          fetchAPI("/v1/settings/enable_payment_methods"),
        ]);
        setDisableCredits(
          disableCreditsRes.data === "true" || disableCreditsRes.data === true
        );
        setEnableRegistration(
          enableRegistrationRes.data === "true" ||
            enableRegistrationRes.data === true
        );
        setEnablePoints(
          enablePointsRes.data === "true" || enablePointsRes.data === true
        );
        setEnableCoupons(
          enableCouponsRes.data === "true" || enableCouponsRes.data === true
        );
        setEnableBadges(
          enableBadgesRes.data === "true" || enableBadgesRes.data === true
        );
        setEnablePaymentMethods(
          enablePaymentMethodsRes.data === "true" ||
            enablePaymentMethodsRes.data === true
        );
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
        const { data: infoData } = await fetchAPI<InfoData>("/whoami");
        if (infoData) {
          setCredits(infoData.credits);
        }

        const { data: gamificationData } = await fetchAPI(
          "/v1/gamification/me"
        );
        if (gamificationData && Array.isArray(gamificationData)) {
          const totalPoints = enablePoints
            ? gamificationData.reduce((sum, g) => sum + g.points, 0)
            : 0;
          const badges = enableBadges
            ? gamificationData.map((g) => g.badge).filter((b) => b !== null)
            : [];

          const previousBadges = JSON.parse(
            localStorage.getItem("badges") || "[]"
          );
          const currentBadgeIds = badges.map((b) => b.id);
          const newBadges = currentBadgeIds.filter(
            (id) => !previousBadges.includes(id)
          );
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

  const availableCoupons = (coupons || []).filter(
    (coupon) =>
      coupon &&
      coupon.status === "active" &&
      (!coupon.expires_at || new Date(coupon.expires_at) > new Date())
  ).length;

  return (
    <>
      <GlassNavbar>
        <NavContainer>
          {/* Sección izquierda: Logo y menú hamburguesa */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={handleDrawerOpen}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Link href="/" passHref>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    cursor: "pointer",
                  }}
                >
                  <Image
                    src="/logo.png"
                    alt="Logo Neptuno"
                    width={40}
                    height={40}
                    style={{ borderRadius: "50%" }}
                  />
                  <Typography
                    variant="h6"
                    component="span"
                    className="app-logo"
                    sx={{
                      fontWeight: "bold",
                      display: {
                        xs: "none",
                        md: "block",
                      },
                    }}
                  >
                    Neptuno
                  </Typography>
                </Box>
              </Link>
            </Box>
          </Box>

          {/* Sección derecha: Elementos específicos para móvil */}
          <Box
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* Mensajes */}
            <Tooltip title="Mensajes (próximamente)">
              <IconButton sx={{ color: theme.palette.text.disabled }}>
                <Mail />
              </IconButton>
            </Tooltip>

            {/* Favoritos */}
            <Tooltip title="Likes (próximamente)">
              <IconButton sx={{ color: theme.palette.text.disabled }}>
                <Favorite />
              </IconButton>
            </Tooltip>

            {/* Marketplace */}
            <Tooltip title="Marketplace">
              <Link href="/checkout" passHref>
              <IconButton sx={{ color: theme.palette.text.disabled }}>
                <ShoppingCartIcon />
              </IconButton>
              </Link>
            </Tooltip>

            {/* Settings solo para admin */}
            {user?.rol === "admin" && (
              <IconButton
                onClick={handleSettingsMenuOpen}
                sx={{ color: "inherit" }}
              >
                <Settings />
              </IconButton>
            )}
          </Box>

          {/* Sección derecha: Versión desktop */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 2,
            }}
          >
            {/* Enlaces desktop */}
            <Box sx={{ display: "flex", gap: 2, mr: 1 }}>
            <Button
                component={Link}
                href="/marketplace"
                className={pathname === "/marketplace" ? "active-link" : ""}
              >
                Markeplace
              </Button>
              <Button
                component={Link}
                href="/ejemplos"
                className={pathname === "/ejemplos" ? "active-link" : ""}
              >
                Ejemplos
              </Button>
              <Button
                component={Link}
                href="/rankings"
                className={pathname === "/rankings" ? "active-link" : ""}
              >
                Rankings
              </Button>
            </Box>

            {/* Iconos de notificaciones - Orden modificado */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Nuevo orden: corazón primero */}
              <Tooltip title="Likes (próximamente)">
                <IconButton sx={{ color: theme.palette.text.disabled }}>
                  <Favorite />
                </IconButton>
              </Tooltip>

              {/* Mensaje segundo */}
              <Tooltip title="Mensajes (próximamente)">
                <IconButton sx={{ color: theme.palette.text.disabled }}>
                  <Mail />
                </IconButton>
              </Tooltip>

              { /* 
              <Tooltip title="Marketplace">
              <Link href="/marketplace" passHref>
                <IconButton sx={{ color: theme.palette.text.primary }}>
                  <StoreIcon />
                </IconButton>
              </Link>
            </Tooltip> 
            */ }
            {/* Carrito existente */}
            <Link href="/checkout" passHref>
              <IconButton className="notification-icon">
                <Badge badgeContent={cartItemsCount} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </Link>

              {/* Créditos tercero */}
              {!disableCredits && credits > 0 && (
                <Link href="/transactions" passHref>
                  <IconButton className="notification-icon">
                    <MonetizationOn />
                    <span className="notification-badge credits-badge">
                      {credits}
                    </span>
                  </IconButton>
                </Link>
              )}

              {enableCoupons && (
                <Link href="/coupon" passHref>
                  <Tooltip title="Tus cupones">
                    <IconButton className="notification-icon">
                      <Badge badgeContent={availableCoupons} color="secondary">
                        <LocalActivity />
                      </Badge>
                    </IconButton>
                  </Tooltip>
                </Link>
              )}

              {gamification && (
                <>
                  {enablePoints && (
                    <Link href="/points" passHref>
                      <IconButton className="notification-icon">
                        <Star />
                        <span className="notification-badge points-badge">
                          {gamification.points}
                        </span>
                      </IconButton>
                    </Link>
                  )}
                  {enableBadges && (
                    <Link href="/badges" passHref>
                      <IconButton className="notification-icon">
                        <EmojiEvents />
                        <span className="notification-badge badges-badge">
                          {gamification.badges.length}
                        </span>
                      </IconButton>
                    </Link>
                  )}
                </>
              )}
            </Box>

            {/* Menú admin y usuario */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {user?.rol === "admin" && (
                <>
                  <IconButton
                    onClick={handleSettingsMenuOpen}
                    sx={{ color: "inherit" }}
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
                    <MenuItem
                      onClick={handleSettingsMenuClose}
                      component={Link}
                      href="/admin/"
                    >
                      <Dashboard sx={{ mr: 1 }} /> Config
                    </MenuItem>
                    <MenuItem
                      onClick={handleSettingsMenuClose}
                      component={Link}
                      href="/gamification"
                    >
                      <EmojiEvents sx={{ mr: 1 }} /> Gamification
                    </MenuItem>
                    <MenuItem
                      onClick={handleSettingsMenuClose}
                      component={Link}
                      href="/revenues"
                    >
                      <MonetizationOn sx={{ mr: 1 }} /> Revenues
                    </MenuItem>
                    <MenuItem
                      onClick={handleSettingsMenuClose}
                      component={Link}
                      href="/admin/registry"
                    >
                      <ListAlt sx={{ mr: 1 }} /> Registros
                    </MenuItem>
                    <MenuItem
                      onClick={handleSettingsMenuClose}
                      component={Link}
                      href="/admin/users"
                    >
                      <People sx={{ mr: 1 }} /> Usuarios
                    </MenuItem>
                  </Menu>
                </>
              )}

              {user ? (
                <Tooltip title={user.username} arrow>
                  <IconButton
                    component={Link}
                    href="/user/"
                    className="user-avatar"
                  >
                    <Avatar
                      sx={{
                        bgcolor: theme.palette.primary.main,
                        width: 40,
                        height: 40,
                        fontSize: "1rem",
                      }}
                    >
                      {user.username[0].toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip
                  title={anonUsername ? "Iniciar sesión" : "Registrarse"}
                  arrow
                >
                  <Box sx={{ position: "relative" }}>
                    <IconButton
                      component={Link}
                      href={
                        anonUsername
                          ? "/auth/login"
                          : "/auth/register"
                      }
                      className="user-avatar"
                    >
                      <Avatar
                        sx={{
                          bgcolor: theme.palette.grey[500],
                          width: 40,
                          height: 40,
                          color: theme.palette.common.white,
                        }}
                      >
                        {anonUsername ? <Person /> : <Key />}
                      </Avatar>
                    </IconButton>
                    {anonUsername && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          backgroundColor: theme.palette.secondary.main,
                          borderRadius: "50%",
                          width: 20,
                          height: 20,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: `2px solid ${theme.palette.background.paper}`,
                        }}
                      >
                        <Key
                          sx={{
                            fontSize: 12,
                            color: theme.palette.common.white,
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Tooltip>
              )}
            </Box>
          </Box>

          {/* Menú hamburguesa */}
          <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerClose}>
            <List>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Image
                    src="/logo.png"
                    alt="Logo Neptuno"
                    width={40}
                    height={40}
                    style={{ borderRadius: "50%" }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      display: "inline-block",
                    }}
                  >
                    Neptuno
                  </Typography>
                </Box>
                <IconButton onClick={handleDrawerClose}>
                  <Close />
                </IconButton>
              </Box>

              <ListItem component={Link} href="/">
                <ListItemIcon>
                  <Home />
                </ListItemIcon>
                <ListItemText primary="Inicio" />
              </ListItem>
              <ListItem component={Link} href="/marketplace">
                <ListItemIcon><StoreIcon /></ListItemIcon>
                <ListItemText primary="Marketplace" />
              </ListItem>
              <ListItem component={Link} href="/ejemplos">
                <ListItemIcon>
                  <School />
                </ListItemIcon>
                <ListItemText primary="Ejemplos" />
              </ListItem>
              <ListItem component={Link} href="/rankings">
                <ListItemIcon>
                  <Leaderboard />
                </ListItemIcon>
                <ListItemText primary="Rankings" />
              </ListItem>
              <ListItem component={Link} href="/about/contact">
                <ListItemIcon>
                  <ContactMail />
                </ListItemIcon>
                <ListItemText primary="Contacto" />
              </ListItem>

              {user?.rol === "admin" && (
                <>
                  <ListItem component={Link} href="/admin/">
                    <ListItemIcon>
                      <Dashboard />
                    </ListItemIcon>
                    <ListItemText primary="Dashboard" />
                  </ListItem>
                  <ListItem component={Link} href="/admin/registry">
                    <ListItemIcon>
                      <ListAlt />
                    </ListItemIcon>
                    <ListItemText primary="Registros" />
                  </ListItem>
                  <ListItem component={Link} href="/admin/users">
                    <ListItemIcon>
                      <People />
                    </ListItemIcon>
                    <ListItemText primary="Usuarios" />
                  </ListItem>
                </>
              )}
              {user ? (
                <ListItem component={Link} href="/user/">
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText primary={user.username} />
                </ListItem>
              ) : (
                <>
                  <ListItem component={Link} href="/auth/login">
                    <ListItemIcon>
                      <Login />
                    </ListItemIcon>
                    <ListItemText primary="Iniciar Sesión" />
                  </ListItem>
                  {enableRegistration && (
                    <ListItem component={Link} href="/auth/register">
                      <ListItemIcon>
                        <PersonAdd />
                      </ListItemIcon>
                      <ListItemText primary="Registrarse" />
                    </ListItem>
                  )}
                </>
              )}
            </List>
          </Drawer>
        </NavContainer>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            ¡Felicidades! Has obtenido el badge: {newBadge}
          </Alert>
        </Snackbar>
      </GlassNavbar>

      <MobileBottomNav>
        {!disableCredits && credits > 0 && (
          <Link href="/transactions" passHref>
            <IconButton className="notification-icon">
              <MonetizationOn />
              <span className="notification-badge credits-badge">
                {credits}
              </span>
            </IconButton>
          </Link>
        )}

        {enableCoupons && (
          <Link href="/coupon" passHref>
            <Tooltip title="Tus cupones">
              <IconButton className="notification-icon">
                <Badge badgeContent={availableCoupons} color="secondary">
                  <LocalActivity />
                </Badge>
              </IconButton>
            </Tooltip>
          </Link>
        )}

        {user ? (
          <Tooltip title={user.username} arrow>
            <IconButton component={Link} href="/user/"> 
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 32,
                  height: 32,
                  fontSize: "0.9rem",
                }}
              >
                {user.username[0].toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip
            title={anonUsername ? "Iniciar sesión" : "Registrarse"}
            arrow
          >
            <IconButton
              component={Link}
              href={anonUsername ? "/auth/login" : "/auth/register"}
            >
              <Avatar
                sx={{
                  bgcolor: theme.palette.grey[500],
                  width: 32,
                  height: 32,
                  color: theme.palette.common.white,
                }}
              >
                {anonUsername ? (
                  <Person fontSize="small" />
                ) : (
                  <Key fontSize="small" />
                )}
              </Avatar>
            </IconButton>
          </Tooltip>
        )}

        {/* Mostrar icono de puntos incluso cuando es 0 */}
        {enablePoints && gamification && (
          <Link href="/points" passHref>
            <IconButton className="notification-icon">
              <Star />
              <span className="notification-badge points-badge">
                {gamification.points || 0}
              </span>
            </IconButton>
          </Link>
        )}

        {gamification?.badges && enableBadges && (
          <Link href="/badges" passHref>
            <IconButton className="notification-icon">
              <EmojiEvents />
              <span className="notification-badge badges-badge">
                {gamification.badges.length}
              </span>
            </IconButton>
          </Link>
        )}
      </MobileBottomNav>
    </>
  );
}
