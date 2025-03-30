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
  TextField, 
  Button, 
  Typography, 
  Alert, 
  AlertTitle,
  Divider,
  IconButton,
  InputAdornment,
  useTheme,
  styled,
  Paper
} from "@mui/material";
import { 
  Email, 
  Lock, 
  Person, 
  ArrowBack, 
  CheckCircle,
  Visibility,
  VisibilityOff
} from "@mui/icons-material";

const AuthContainer = styled(Paper)(({ theme }) => ({
  maxWidth: 450,
  width: '100%',
  padding: theme.spacing(4),
  borderRadius: '16px',
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  boxShadow: theme.shadows[10],
  overflow: 'hidden',
  position: 'relative'
}));

const AuthCard = styled(motion.div)({
  width: '100%',
  display: 'flex',
  flexDirection: 'column'
});

const AuthButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5),
  borderRadius: '12px',
  fontWeight: 'bold',
  fontSize: '1rem',
  textTransform: 'none',
  marginTop: theme.spacing(2)
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
  const [showPassword, setShowPassword] = useState(false);
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
      setSuccess("¡Inicio de sesión exitoso! Redirigiendo...");
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
      setSuccess("¡Registro exitoso! Redirigiendo...");
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
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      p: 2
    }}>
      <AuthContainer elevation={3}>
        <AnimatePresence mode="wait">
          {mode === "login" && (
            <AuthCard
              key="login"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h4" component="h1" sx={{ 
                fontWeight: 'bold', 
                mb: 4,
                textAlign: 'center',
                color: theme.palette.primary.main
              }}>
                Iniciar Sesión
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                  <AlertTitle>Error</AlertTitle>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                  <AlertTitle>Éxito</AlertTitle>
                  {success}
                </Alert>
              )}

              <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <AuthButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Iniciar Sesión
                </AuthButton>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Typography variant="body2" sx={{ textAlign: 'center' }}>
                  ¿No tienes cuenta?{' '}
                  {enableRegistration ? (
                    <Button 
                      onClick={() => changeMode("register")}
                      sx={{ 
                        textTransform: 'none',
                        color: theme.palette.secondary.main,
                        fontWeight: 'bold'
                      }}
                    >
                      Regístrate
                    </Button>
                  ) : (
                    <Typography variant="caption" color="textSecondary">
                      Registro deshabilitado
                    </Typography>
                  )}
                </Typography>

                <Button 
                  onClick={() => changeMode("reset")}
                  sx={{ 
                    textTransform: 'none',
                    color: theme.palette.text.secondary
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </Box>
            </AuthCard>
          )}

          {mode === "register" && (
            <AuthCard
              key="register"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => changeMode("login")} sx={{ mr: 1 }}>
                  <ArrowBack />
                </IconButton>
                <Typography variant="h4" component="h1" sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.primary.main
                }}>
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
                  <AlertTitle>Error</AlertTitle>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                  <AlertTitle>Éxito</AlertTitle>
                  {success}
                </Alert>
              )}

              <Box component="form" onSubmit={handleRegister} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  disabled={!enableRegistration}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Nombre de usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  fullWidth
                  disabled={!enableRegistration}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  disabled={!enableRegistration}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          disabled={!enableRegistration}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <AuthButton
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={!enableRegistration}
                >
                  Registrarse
                </AuthButton>
              </Box>

              <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
                ¿Ya tienes cuenta?{' '}
                <Button 
                  onClick={() => changeMode("login")}
                  sx={{ 
                    textTransform: 'none',
                    color: theme.palette.secondary.main,
                    fontWeight: 'bold'
                  }}
                >
                  Inicia sesión
                </Button>
              </Typography>
            </AuthCard>
          )}

          {mode === "reset" && (
            <AuthCard
              key="reset"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <IconButton onClick={() => changeMode("login")} sx={{ mr: 1 }}>
                  <ArrowBack />
                </IconButton>
                <Typography variant="h4" component="h1" sx={{ 
                  fontWeight: 'bold',
                  color: theme.palette.primary.main
                }}>
                  Recuperar Contraseña
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                  <AlertTitle>Error</AlertTitle>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                  <AlertTitle>Éxito</AlertTitle>
                  {success}
                </Alert>
              )}

              {!success ? (
                <Box component="form" onSubmit={handleResetPassword} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <AuthButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Solicitar Recuperación
                  </AuthButton>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleConfirmReset} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <TextField
                    label="Token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    fullWidth
                  />

                  <TextField
                    label="Nueva Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <AuthButton
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Actualizar Contraseña
                  </AuthButton>
                </Box>
              )}

              <Typography variant="body2" sx={{ textAlign: 'center', mt: 3 }}>
                <Button 
                  onClick={() => changeMode("login")}
                  sx={{ 
                    textTransform: 'none',
                    color: theme.palette.secondary.main,
                    fontWeight: 'bold'
                  }}
                >
                  Volver a Iniciar Sesión
                </Button>
              </Typography>
            </AuthCard>
          )}
        </AnimatePresence>
      </AuthContainer>
    </Box>
  );
}