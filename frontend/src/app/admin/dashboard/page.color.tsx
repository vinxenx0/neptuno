// src/app/admin/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/context";
import { useRouter } from "next/navigation";
import fetchAPI from "@/lib/api";
import { AnimatePresence, motion } from "framer-motion";
import {
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Badge,
  Paper,
  useTheme,
  styled,
  Box,
  Switch,
  FormControlLabel
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { 
  AddCircle, 
  Delete, 
  ExpandMore, 
  Settings, 
  Public, 
  Link, 
  Webhook,
  CheckCircle,
  Cancel,
  Security,
  PersonAdd,
  LockPerson,
  PeopleOutline,
  AttachMoney
} from "@mui/icons-material";


import { SiteSetting, Integration } from "@/lib/types";

// Styled Components (se mantienen igual)
const AdminGradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
  borderRadius: '16px',
  boxShadow: theme.shadows[10],
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)'
  }
}));

const ConfigGlassCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '16px',
  boxShadow: theme.shadows[5]
}));

export default function ConfigurePage() {
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [settingsByTag, setSettingsByTag] = useState<Record<string, SiteSetting[]>>({});
  const [origins, setOrigins] = useState<string[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [newOrigin, setNewOrigin] = useState("");
  const [newIntegration, setNewIntegration] = useState({ name: "", webhook_url: "", event_type: "" });
  const [features, setFeatures] = useState({
    enable_registration: true,
    enable_social_login: true,
    disable_anonymous_users: false,
    disable_credits: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.rol !== "admin") {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const settingsRes = await fetchAPI<SiteSetting[]>("/v1/settings/admin/config");
        const grouped = settingsRes.data?.reduce((acc, setting) => {
          const tag = setting.tag || "General";
          if (!acc[tag]) acc[tag] = [];
          acc[tag].push(setting);
          return acc;
        }, {} as Record<string, SiteSetting[]>);
        setSettingsByTag(grouped || {});

        const originsRes = await fetchAPI<string[]>("/v1/settings/allowed_origins");
        setOrigins(originsRes.data || []);

        const integrationsRes = await fetchAPI<Integration[]>("/v1/integrations/");
        setIntegrations(integrationsRes.data || []);

        // Cargar el estado inicial de las funcionalidades
        const featuresRes = await Promise.all([
          fetchAPI("/v1/settings/enable_registration"),
          fetchAPI("/v1/settings/enable_social_login"),
          fetchAPI("/v1/settings/disable_anonymous_users"),
          fetchAPI("/v1/settings/disable_credits"),
        ]);
        setFeatures({
          enable_registration: featuresRes[0].data === "true",
          enable_social_login: featuresRes[1].data === "true",
          disable_anonymous_users: featuresRes[2].data === "true",
          disable_credits: featuresRes[3].data === "true",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, router]);

  // Handler functions (se mantienen igual)
  const handleSaveSetting = async (key: string, newValue: string) => {
    try {
      await fetchAPI("/v1/settings/admin/config", {
        method: "POST",
        data: { key, value: newValue },
      });
      setSettingsByTag((prev) => {
        const updated = { ...prev };
        for (const tag in updated) {
          updated[tag] = updated[tag].map((s) => (s.key === key ? { ...s, value: newValue } : s));
        }
        return updated;
      });
      setSuccess("Configuración actualizada");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar configuración");
    }
  };

  const handleAddOrigin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI("/v1/settings/allowed-origins", {
        method: "POST",
        data: { origin: newOrigin },
      });
      setOrigins([...origins, newOrigin]);
      setNewOrigin("");
      setSuccess("Origen añadido con éxito");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al añadir origen");
    }
  };

  const handleAddIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await fetchAPI<Integration>("/v1/integrations/", {
        method: "POST",
        data: {
          name: newIntegration.name,
          webhook_url: newIntegration.webhook_url,
          event_type: newIntegration.event_type,
        },
      });
      setIntegrations([...integrations, data!]);
      setNewIntegration({ name: "", webhook_url: "", event_type: "" });
      setSuccess("Integración creada con éxito");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear integración");
    }
  };

  const handleToggleFeature = async (feature: string, enabled: boolean) => {
    try {
      await fetchAPI("/v1/settings/admin/config", {
        method: "POST",
        data: { key: feature, value: enabled.toString() },
      });
      setFeatures((prev) => ({ ...prev, [feature]: enabled }));
      setSuccess(`Funcionalidad ${enabled ? "activada" : "desactivada"} con éxito`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar funcionalidad");
    }
  };

  if (loading) return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Typography variant="h6" color="textSecondary">Cargando panel de administración...</Typography>
      </motion.div>
    </Box>
  );

  return (
    <Box sx={{ 
      p: { xs: 2, md: 4 }, 
      minHeight: "100vh",
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Header Section (se mantiene igual) */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 4,
          gap: 2
        }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold', 
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              Panel de Administración
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Gestiona la configuración del sistema
            </Typography>
          </motion.div>
          
          <Badge
            overlap="circular"
            badgeContent={
              <Chip 
                label="Admin" 
                size="small" 
                color="primary" 
                sx={{ 
                  position: 'absolute', 
                  top: -10, 
                  right: -10,
                  fontWeight: 'bold'
                }}
              />
            }
          >
            <Avatar
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: theme.palette.error.main,
                fontSize: '2rem',
                boxShadow: theme.shadows[6]
              }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
        </Box>

        {/* Stats Cards - Se añade tarjeta para funcionalidades */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <AdminGradientCard sx={{ flex: 1, minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>
                    Configuraciones
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {Object.values(settingsByTag).flat().length}
                  </Typography>
                </Box>
                <Settings sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </AdminGradientCard>

          <AdminGradientCard sx={{ flex: 1, minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>
                    Orígenes Permitidos
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {origins.length}
                  </Typography>
                </Box>
                <Public sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </AdminGradientCard>

          <AdminGradientCard sx={{ flex: 1, minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>
                    Integraciones
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {integrations.length}
                  </Typography>
                </Box>
                <Webhook sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </AdminGradientCard>

          <AdminGradientCard sx={{ flex: 1, minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="overline" color="inherit" sx={{ opacity: 0.8 }}>
                    Funcionalidades
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    4
                  </Typography>
                </Box>
                <LockPerson sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </AdminGradientCard>
        </Box>

        {/* Tabs Navigation - Se añade pestaña de Funcionalidades */}
        <Paper sx={{ mb: 3, borderRadius: '12px', overflow: 'hidden' }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Configuraciones" icon={<Settings />} iconPosition="start" />
            <Tab label="Orígenes Permitidos" icon={<Security />} iconPosition="start" />
            <Tab label="Integraciones" icon={<Link />} iconPosition="start" />
            <Tab label="Funcionalidades" icon={<LockPerson />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* Tab Content - Se añade contenido para pestaña de Funcionalidades */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Configurations Tab (se mantiene igual) */}
          {activeTab === 0 && (
            <Box sx={{ mb: 4 }}>
              {Object.entries(settingsByTag).map(([tag, settings]) => (
                <ConfigGlassCard key={tag} sx={{ mb: 2 }}>
                  <Accordion 
                    sx={{ 
                      background: 'transparent',
                      boxShadow: 'none'
                    }}
                  >
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ 
                          bgcolor: theme.palette.primary.main,
                          width: 32, 
                          height: 32 
                        }}>
                          <Settings sx={{ fontSize: 16 }} />
                        </Avatar>
                        <Typography variant="h6">{tag}</Typography>
                        <Chip 
                          label={`${settings.length} configs`} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        {settings.map((setting) => (
                          <Grid item xs={12} md={6} key={setting.key}>
                            <TextField
                              label={setting.key}
                              defaultValue={setting.value}
                              onBlur={(e) => handleSaveSetting(setting.key, e.target.value)}
                              fullWidth
                              variant="outlined"
                              size="small"
                              helperText={setting.description}
                              InputProps={{
                                sx: { borderRadius: '12px' }
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </ConfigGlassCard>
              ))}
            </Box>
          )}

          {/* Allowed Origins Tab (se mantiene igual) */}
          {activeTab === 1 && (
            <Box sx={{ mb: 4 }}>
              <ConfigGlassCard sx={{ mb: 3 }}>
                <CardContent>
                  <Box 
                    component="form" 
                    onSubmit={handleAddOrigin} 
                    sx={{ display: 'flex', gap: 2 }}
                  >
                    <TextField
                      label="Nuevo Origen Permitido"
                      value={newOrigin}
                      onChange={(e) => setNewOrigin(e.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                      placeholder="https://example.com"
                      InputProps={{
                        startAdornment: <Public color="action" sx={{ mr: 1 }} />
                      }}
                    />
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      startIcon={<AddCircle />}
                      sx={{ minWidth: '120px' }}
                    >
                      Añadir
                    </Button>
                  </Box>
                </CardContent>
              </ConfigGlassCard>

              {origins.length > 0 ? (
                <Grid container spacing={2}>
                  {origins.map((origin, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <ConfigGlassCard>
                        <CardContent sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Public color="primary" />
                            <Typography noWrap sx={{ maxWidth: '200px' }}>
                              {origin}
                            </Typography>
                          </Box>
                          <IconButton color="error">
                            <Delete />
                          </IconButton>
                        </CardContent>
                      </ConfigGlassCard>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <ConfigGlassCard>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Public sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="h6" color="textSecondary">
                      No hay orígenes permitidos configurados
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Añade un origen para permitir solicitudes desde ese dominio
                    </Typography>
                  </CardContent>
                </ConfigGlassCard>
              )}
            </Box>
          )}

          {/* Integrations Tab (se mantiene igual) */}
          {activeTab === 2 && (
            <Box sx={{ mb: 4 }}>
              <ConfigGlassCard sx={{ mb: 3 }}>
                <CardContent>
                  <Box 
                    component="form" 
                    onSubmit={handleAddIntegration} 
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <TextField
                      label="Nombre de la Integración"
                      value={newIntegration.name}
                      onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                      fullWidth
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <Link color="action" sx={{ mr: 1 }} />
                      }}
                    />
                    <TextField
                      label="Webhook URL"
                      value={newIntegration.webhook_url}
                      onChange={(e) => setNewIntegration({ ...newIntegration, webhook_url: e.target.value })}
                      fullWidth
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <Webhook color="action" sx={{ mr: 1 }} />
                      }}
                    />
                    <TextField
                      label="Tipo de Evento"
                      value={newIntegration.event_type}
                      onChange={(e) => setNewIntegration({ ...newIntegration, event_type: e.target.value })}
                      fullWidth
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: <Settings color="action" sx={{ mr: 1 }} />
                      }}
                    />
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      startIcon={<AddCircle />}
                      sx={{ mt: 1 }}
                    >
                      Crear Integración
                    </Button>
                  </Box>
                </CardContent>
              </ConfigGlassCard>

              {integrations.length > 0 ? (
                <Grid container spacing={2}>
                  {integrations.map((integration) => (
                    <Grid item xs={12} md={6} key={integration.id}>
                      <ConfigGlassCard>
                        <CardContent>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 2
                          }}>
                            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Webhook color="primary" />
                              {integration.name}
                            </Typography>
                            <Chip 
                              label={integration.active ? "Activo" : "Inactivo"} 
                              color={integration.active ? "success" : "error"} 
                              size="small"
                              icon={integration.active ? <CheckCircle /> : <Cancel />}
                            />
                          </Box>
                          
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            <strong>Webhook:</strong> {integration.webhook_url}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            <strong>Evento:</strong> {integration.event_type}
                          </Typography>
                        </CardContent>
                      </ConfigGlassCard>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <ConfigGlassCard>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Webhook sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="h6" color="textSecondary">
                      No hay integraciones configuradas
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Crea una integración para conectar con servicios externos
                    </Typography>
                  </CardContent>
                </ConfigGlassCard>
              )}
            </Box>
          )}

          {/* Features Tab - Nueva pestaña */}
          {activeTab === 3 && (
            <Box sx={{ mb: 4 }}>
              <ConfigGlassCard>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3 }}>
                    <LockPerson sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Control de Funcionalidades
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <ConfigGlassCard sx={{ p: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={features.enable_registration}
                            onChange={(e) => handleToggleFeature("enable_registration", e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <PersonAdd color={features.enable_registration ? "primary" : "disabled"} />
                            <Typography variant="body1">
                              Habilitar Registro
                              <Typography variant="caption" display="block" color="textSecondary">
                                Permite a nuevos usuarios registrarse en la plataforma
                              </Typography>
                            </Typography>
                          </Box>
                        }
                        sx={{ width: '100%' }}
                      />
                    </ConfigGlassCard>

                    <ConfigGlassCard sx={{ p: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={features.enable_social_login}
                            onChange={(e) => handleToggleFeature("enable_social_login", e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <PeopleOutline color={features.enable_social_login ? "primary" : "disabled"} />
                            <Typography variant="body1">
                              Habilitar Login Social
                              <Typography variant="caption" display="block" color="textSecondary">
                                Permite el inicio de sesión con proveedores sociales
                              </Typography>
                            </Typography>
                          </Box>
                        }
                        sx={{ width: '100%' }}
                      />
                    </ConfigGlassCard>

                    <ConfigGlassCard sx={{ p: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={features.disable_anonymous_users}
                            onChange={(e) => handleToggleFeature("disable_anonymous_users", e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <LockPerson color={features.disable_anonymous_users ? "error" : "disabled"} />
                            <Typography variant="body1">
                              Deshabilitar Usuarios Anónimos
                              <Typography variant="caption" display="block" color="textSecondary">
                                Impide el acceso a usuarios no registrados
                              </Typography>
                            </Typography>
                          </Box>
                        }
                        sx={{ width: '100%' }}
                      />
                    </ConfigGlassCard>

                    <ConfigGlassCard sx={{ p: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={features.disable_credits}
                            onChange={(e) => handleToggleFeature("disable_credits", e.target.checked)}
                            color="primary"
                          />
                        }
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AttachMoney color={features.disable_credits ? "error" : "disabled"} />
                            <Typography variant="body1">
                              Desactivar Créditos
                              <Typography variant="caption" display="block" color="textSecondary">
                                Deshabilita el sistema de créditos en la plataforma
                              </Typography>
                            </Typography>
                          </Box>
                        }
                        sx={{ width: '100%' }}
                      />
                    </ConfigGlassCard>
                  </Box>
                </CardContent>
              </ConfigGlassCard>
            </Box>
          )}
        </motion.div>
      </Box>

      {/* Notifications (se mantiene igual) */}
      <AnimatePresence>
        {error && (
          <Snackbar 
            open 
            autoHideDuration={3000} 
            onClose={() => setError(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Alert 
                severity="error" 
                onClose={() => setError(null)}
                sx={{ boxShadow: theme.shadows[6], borderRadius: '12px' }}
              >
                {error}
              </Alert>
            </motion.div>
          </Snackbar>
        )}
        {success && (
          <Snackbar 
            open 
            autoHideDuration={3000} 
            onClose={() => setSuccess(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Alert 
                severity="success" 
                onClose={() => setSuccess(null)}
                sx={{ boxShadow: theme.shadows[6], borderRadius: '12px' }}
              >
                {success}
              </Alert>
            </motion.div>
          </Snackbar>
        )}
      </AnimatePresence>
    </Box>
  );
}