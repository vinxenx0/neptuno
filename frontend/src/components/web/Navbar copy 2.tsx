// src/components/Navbar.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  Typography
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
  Home
} from "@mui/icons-material";

const GlassNavbar = styled('nav')(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 1100,
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: theme.shadows[1]
}));

const NavContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(2),
  maxWidth: '1400px',
  margin: '0 auto'
}));

const CreditsChip = styled(Chip)(({ theme }) => ({
  fontWeight: 'bold',
  borderRadius: '12px',
  '& .MuiChip-icon': {
    color: theme.palette.warning.main
  }
}));

export default function Navbar() {
  const theme = useTheme();
  const { user, credits, logout } = useAuth();
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
  const [disableCredits, setDisableCredits] = useState(false);
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [anonUsername, setAnonUsername] = useState<string | null>(null);

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
        setDisableCredits(false);
        setEnableRegistration(true);
      }
    };
    fetchSettings();
  }, []);

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
              color="primary"
              variant="outlined"
            />
          )}

          {user?.rol === "admin" && (
            <>
              <IconButton
                onClick={handleSettingsMenuOpen}
                sx={{ 
                  color: 'inherit',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
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
                <MenuItem 
                  onClick={handleSettingsMenuClose}
                  component={Link}
                  href="/admin/dashboard"
                  sx={{ borderRadius: '8px', my: 0.5 }}
                >
                  <Dashboard sx={{ mr: 1 }} /> Dashboard
                </MenuItem>
                <MenuItem 
                  onClick={handleSettingsMenuClose}
                  component={Link}
                  href="/admin/registry"
                  sx={{ borderRadius: '8px', my: 0.5 }}
                >
                  <ListAlt sx={{ mr: 1 }} /> Registros
                </MenuItem>
                <MenuItem 
                  onClick={handleSettingsMenuClose}
                  component={Link}
                  href="/admin/users"
                  sx={{ borderRadius: '8px', my: 0.5 }}
                >
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
              sx={{
                color: 'inherit',
                textTransform: 'none',
                fontWeight: 'medium'
              }}
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
              <Button
                component={Link}
                href="/user/auth/#login"
                startIcon={<Login />}
                sx={{ borderRadius: '12px' }}
              >
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
    </GlassNavbar>
  );
}