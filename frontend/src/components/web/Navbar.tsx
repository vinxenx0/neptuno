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
  Alert
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
  EmojiEvents
} from "@mui/icons-material";

const GlassNavbar = styled('nav')(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderBottom: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1, 2),
  position: 'sticky',
  top: 0,
  zIndex: 1000,
}));

const NavContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  maxWidth: '1200px',
  margin: '0 auto',
}));

const CreditsChip = styled(Chip)(({ theme }) => ({
  background: 'rgba(255, 165, 0, 0.2)', // Fondo naranja claro
  color: '#FFA500', // Texto naranja
  borderColor: '#FFA500',
}));

const PointsChip = styled(Chip)(({ theme }) => ({
  background: 'rgba(255, 215, 0, 0.2)', // Fondo dorado claro
  color: '#FFD700', // Texto dorado
  borderColor: '#FFD700',
}));

const BadgesChip = styled(Chip)(({ theme }) => ({
  background: 'rgba(0, 128, 0, 0.2)', // Fondo verde claro
  color: '#008000', // Texto verde
  borderColor: '#008000',
}));

export default function Navbar() {
  const theme = useTheme();
  const { user, credits, gamification, setCredits, setGamification, logout } = useAuth();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [disableCredits, setDisableCredits] = useState(false);
  const [enableRegistration, setEnableRegistration] = useState(true);
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
        const disableCreditsRes = await fetchAPI("/v1/settings/disable_credits");
        const enableRegistrationRes = await fetchAPI("/v1/settings/enable_registration");
        setDisableCredits(disableCreditsRes.data === "true" || disableCreditsRes.data === true);
        setEnableRegistration(enableRegistrationRes.data === "true" || enableRegistrationRes.data === true);
      } catch (err) {
        console.error("Error al obtener configuraciones:", err);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data: infoData } = await fetchAPI<UserInfo>("/info");
        if (infoData) {
          setCredits(infoData.credits);
        }

        const { data: gamificationData } = await fetchAPI<UserGamificationResponse[]>("/v1/gamification/me");
        if (gamificationData && Array.isArray(gamificationData)) {
          const totalPoints = gamificationData.reduce((sum, g) => sum + g.points, 0);
          const badges = gamificationData.map(g => g.badge).filter(b => b !== null) as Badge[];
          
          // Detectar nuevos badges
          const previousBadges = JSON.parse(localStorage.getItem("badges") || "[]");
          const currentBadgeIds = badges.map(b => b.id);
          const newBadges = currentBadgeIds.filter(id => !previousBadges.includes(id));
          if (newBadges.length > 0) {
            const badge = badges.find(b => b.id === newBadges[0]);
            setNewBadge(badge?.name || "Nuevo badge");
            setSnackbarOpen(true);
            localStorage.setItem("badges", JSON.stringify(currentBadgeIds));
          }

          setGamification({ points: totalPoints, badges });
        }
      } catch (err) {
        console.error("Error al actualizar datos:", err);
      }
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [setCredits, setGamification]);

  const handleSettingsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsAnchorEl(null);
  };

  return (
    <GlassNavbar>
      <NavContainer>
        <Link href="/" passHref>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}>
            <Home color="primary" />
            <Typography 
              variant="h6" 
              component="span" 
              sx={{ 
                fontWeight: 'bold',
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Neptuno
            </Typography>
          </Box>
        </Link>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {!disableCredits && credits > 0 && (
            <CreditsChip
              icon={<MonetizationOn />}
              label={credits}
              variant="outlined"
            />
          )}

          {gamification && (
            <>
              <PointsChip
                icon={<Star />}
                label={gamification.points}
                variant="outlined"
              />
              <BadgesChip
                icon={<EmojiEvents />}
                label={gamification.badges.length}
                variant="outlined"
              />
            </>
          )}

          {user?.rol === "admin" && (
            <>
              <IconButton
                onClick={handleSettingsMenuOpen}
                sx={{ color: 'inherit', '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' } }}
              >
                <Settings />
              </IconButton>
              <Menu
                anchorEl={settingsAnchorEl}
                open={Boolean(settingsAnchorEl)}
                onClose={handleSettingsMenuClose}
                PaperProps={{
                  sx: {
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    mt: 1,
                    minWidth: '200px'
                  }
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
              </Menu>
            </>
          )}

          {user ? (
            <Button
              component={Link}
              href="/user/dashboard"
              startIcon={<Person />}
              endIcon={<ArrowDropDown />}
              sx={{ color: 'inherit', textTransform: 'none', fontWeight: 'medium' }}
            >
              {user.username}
            </Button>
          ) : anonUsername ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                sx={{ borderRadius: '12px' }}
              >
                ¡Empezar!
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={Link} href="/user/auth/#login" startIcon={<Login />} sx={{ borderRadius: '12px' }}>
                Iniciar Sesión
              </Button>
              {enableRegistration && (
                <Button
                  component={Link}
                  href="/user/auth/#register"
                  variant="contained"
                  color="primary"
                  startIcon={<PersonAdd />}
                  sx={{ borderRadius: '12px' }}
                >
                  Registrarse
                </Button>
              )}
            </Box>
          )}
        </Box>
      </NavContainer>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
          ¡Felicidades! Has obtenido el badge: {newBadge}
        </Alert>
      </Snackbar>
    </GlassNavbar>
  );
}