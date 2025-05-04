// src/app/user/auth/page.tsx..
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth/context";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { RegisterRequest } from "@/lib/types";
import fetchAPI from "@/lib/api";
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Snackbar, 
  Divider, 
  useTheme,
  styled,
  Container,
  Avatar,
  IconButton,
  Chip
} from "@mui/material";
import { 
  Lock, 
  Person, 
  Email, 
  ArrowBack,
  VerifiedUser,
  VpnKey,
  PersonAdd,
  EmojiEvents,
  Stars
} from "@mui/icons-material";

// Styled Components
const AuthGlassCard = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '24px',
  boxShadow: theme.shadows[10],
  padding: theme.spacing(6),
  width: '100%',
  maxWidth: '500px',
  margin: '0 auto'
}));

const AuthButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: theme.spacing(2),
  fontWeight: 'bold',
  fontSize: '1rem',
  textTransform: 'none',
  marginTop: theme.spacing(2)
}));

const AuthLayoutContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
}));

export default function AuthPage() {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [enableRegistration, setEnableRegistration] = useState(true);
  const { login, register } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash === "register" && enableRegistration) {
        setMode("register");
      } else if (hash === "reset") {
        setMode("reset");
      } else {
        setMode("login");
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [enableRegistration]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const enableRegistrationRes = await fetchAPI("/v1/settings/enable_registration");
        setEnableRegistration(enableRegistrationRes.data === "true" || enableRegistrationRes.data === true);
      } catch (err) {
        console.error("Error al obtener configuraciones:", err);
        setEnableRegistration(true);
      }
    };
    fetchSettings();
  }, []);

  const changeMode = (newMode: "login" | "register" | "reset") => {
    setMode(newMode);
    if (newMode === "login") {
      router.replace(pathname);
    } else {
      window.location.hash = newMode;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      await login(email, password);
      
      // Gamificación: Punto por login exitoso
      try {
        await fetchAPI("/v1/gamification/events", {
          method: "POST",
          data: { event_type_id: 100 } // ID del evento de login
        });
        setSuccess("¡Inicio de sesión exitoso! Redirigiendo... (+1 punto 🎉)");
      } catch (gamErr) {
        setSuccess("¡Inicio de sesión exitoso! Redirigiendo...");
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!enableRegistration) return;
    try {
      const data: RegisterRequest = { email, username, password };
      await register(data);

      // Gamificación: Eventos de progreso y badge
      try {
        // Registrar progreso por cada campo completado
        await Promise.all([
          fetchAPI("/v1/gamification/events", { 
            method: "POST",
            data: { event_type_id: 101 } // Email completado
          }),
          fetchAPI("/v1/gamification/events", { 
            method: "POST",
            data: { event_type_id: 102 } // Username completado
          }),
          fetchAPI("/v1/gamification/events", { 
            method: "POST",
            data: { event_type_id: 103 } // Password completado
          })
        ]);
        
        // Otorgar badge por registro completo
        await fetchAPI("/v1/gamification/events", { 
          method: "POST",
          data: { event_type_id: 104 } // Badge de registro completo
        });
        
        setSuccess("¡Registro exitoso! 🏆 ¡Insignia obtenida! Redirigiendo...");
      } catch (gamErr) {
        setSuccess("¡Registro exitoso! Redirigiendo...");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al registrarse";
      if (errorMessage.includes("email")) {
        setError("El email ya está registrado");
      } else if (errorMessage.includes("username")) {
        setError("El nombre de usuario ya está en uso");
      } else {
        setError(errorMessage);
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await fetchAPI<{ message: string; token?: string }>("/v1/auth/password-reset", {
        method: "POST",
        data: { email },
      });
      if (error) throw new Error(error as string);
      setSuccess(data?.message || "Solicitud enviada, revisa tu correo.");
      setToken(data?.token || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al solicitar recuperación");
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const { data, error } = await fetchAPI<{ message: string }>("/v1/auth/password-reset/confirm", {
        method: "POST",
        data: { token, new_password: newPassword },
      });
      if (error) throw new Error(error as string);
      setSuccess(data?.message || "Contraseña actualizada con éxito.");
      setTimeout(() => setMode("login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar contraseña");
    }
  };

  return (
    <AuthLayoutContainer>
      <Box component="header" sx={{ p: 4, textAlign: 'center' }}>
        <Link href="/" passHref>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <VerifiedUser />
            </Avatar>
            <Typography 
              variant="h4" 
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
      </Box>

      <Box component="main" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
        <AuthGlassCard>
          <AnimatePresence mode="wait">
            {mode === "login" && (
              <motion.div
                key="login"
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Lock color="primary" sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Iniciar Sesión
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Accede a tu cuenta para continuar
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                    {success}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleLogin} sx={{ mt: 3 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    InputProps={{
                      startAdornment: <Email color="action" sx={{ mr: 1 }} />
                    }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    InputProps={{
                      startAdornment: <VpnKey color="action" sx={{ mr: 1 }} />
                    }}
                    sx={{ mb: 2 }}
                  />
                  <AuthButton
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<Lock />}
                  >
                    Iniciar Sesión
                  </AuthButton>
                </Box>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Chip 
                    icon={<EmojiEvents />}
                    label="+1 punto por cada login"
                    color="warning"
                    variant="outlined"
                  />
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  {enableRegistration ? (
                    <Button onClick={() => changeMode("register")} color="secondary">
                      Crear una cuenta
                    </Button>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Registro deshabilitado
                    </Typography>
                  )}
                  <Button onClick={() => changeMode("reset")} color="inherit">
                    ¿Olvidaste tu contraseña?
                  </Button>
                </Box>
              </motion.div>
            )}

            {mode === "register" && (
              <motion.div
                key="register"
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <IconButton onClick={() => changeMode("login")} sx={{ mr: 1 }}>
                    <ArrowBack />
                  </IconButton>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Crear Cuenta
                  </Typography>
                </Box>

                {!enableRegistration && (
                  <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
                    El registro está deshabilitado en este momento.
                  </Alert>
                )}
                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                    {success}
                  </Alert>
                )}

                <Box sx={{ textAlign: 'center', mt: 2, mb: 3 }}>
                  <Chip 
                    icon={<Stars />}
                    label="¡Gana 3 puntos + insignia al registrarte!"
                    color="secondary"
                    variant="outlined"
                  />
                </Box>

                <Box component="form" onSubmit={handleRegister} sx={{ mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    disabled={!enableRegistration}
                    InputProps={{
                      startAdornment: <Email color="action" sx={{ mr: 1 }} />
                    }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Nombre de usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    margin="normal"
                    disabled={!enableRegistration}
                    InputProps={{
                      startAdornment: <Person color="action" sx={{ mr: 1 }} />
                    }}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    disabled={!enableRegistration}
                    InputProps={{
                      startAdornment: <VpnKey color="action" sx={{ mr: 1 }} />
                    }}
                    sx={{ mb: 2 }}
                  />
                  <AuthButton
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={!enableRegistration}
                    startIcon={<PersonAdd />}
                  >
                    Registrarse
                  </AuthButton>
                </Box>

                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
                  ¿Ya tienes una cuenta?{' '}
                  <Button onClick={() => changeMode("login")} color="primary">
                    Inicia sesión
                  </Button>
                </Typography>
              </motion.div>
            )}

            {mode === "reset" && (
              <motion.div
                key="reset"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <IconButton onClick={() => changeMode("login")} sx={{ mr: 1 }}>
                    <ArrowBack />
                  </IconButton>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Recuperar Contraseña
                  </Typography>
                </Box>

                {error && (
                  <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                    {error}
                  </Alert>
                )}
                {success && (
                  <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                    {success}
                  </Alert>
                )}

                {!success ? (
                  <Box component="form" onSubmit={handleResetPassword} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      margin="normal"
                      InputProps={{
                        startAdornment: <Email color="action" sx={{ mr: 1 }} />
                      }}
                      sx={{ mb: 2 }}
                    />
                    <AuthButton
                      fullWidth
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<VpnKey />}
                    >
                      Solicitar Recuperación
                    </AuthButton>
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handleConfirmReset} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Token"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      margin="normal"
                      InputProps={{
                        startAdornment: <VerifiedUser color="action" sx={{ mr: 1 }} />
                      }}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Nueva Contraseña"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      margin="normal"
                      InputProps={{
                        startAdornment: <VpnKey color="action" sx={{ mr: 1 }} />
                      }}
                      sx={{ mb: 2 }}
                    />
                    <AuthButton
                      fullWidth
                      type="submit"
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<Lock />}
                    >
                      Actualizar Contraseña
                    </AuthButton>
                  </Box>
                )}

                <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
                  <Button onClick={() => changeMode("login")} color="primary">
                    Volver a Iniciar Sesión
                  </Button>
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </AuthGlassCard>
      </Box>

      <Box component="footer" sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} Neptuno. Todos los derechos reservados.
        </Typography>
      </Box>
    </AuthLayoutContainer>
  );
}