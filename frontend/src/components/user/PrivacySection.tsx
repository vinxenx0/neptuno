// frontend/src/components/user/PrivacySection.tsx
// src/components/user/PrivacySection.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Tabs,
  Tab,
  Switch,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Link,
  Avatar,
  Grid,
} from "@mui/material";
import { Shield as ShieldCheckIcon, Delete as TrashIcon, Settings as CogIcon, Description as DocumentTextIcon, Mail as EnvelopeIcon } from "@mui/icons-material";
import { consentUpdate, injectGTM } from "@/lib/gdpr/gtm";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

const hoverVariants = {
  hover: { y: -5, scale: 1.02, transition: { duration: 0.3 } },
};

interface PrivacySectionProps {
  onDeleteAccount: () => Promise<void>;
}

export default function PrivacySection({ onDeleteAccount }: PrivacySectionProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [consent, setConsent] = useState(null);
  const [complianceJson, setComplianceJson] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dataRequests, setDataRequests] = useState([]);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [adsConsent, setAdsConsent] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const stored = localStorage.getItem("cookie_consent");
    const analytics = localStorage.getItem("analytics_consent") === "true";
    const ads = localStorage.getItem("ads_consent") === "true";

    if (stored) {
      setConsent({ cookie_consent: stored, analytics_consent: analytics, ads_consent: ads });
      setAnalyticsConsent(analytics);
      setAdsConsent(ads);
    }

    setTimeout(() => {
      setDataRequests([{ id: 1, type: "Datos personales", date: new Date().toISOString().split("T")[0], status: "Completado" }]);
      setIsLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    const fetchConsent = async () => {
      try {
        const res = await fetch("/api/privacy?userId=usuario123");
        if (res.ok) {
          const data = await res.json();
          setConsent(data.consentData);
        }
      } catch (err) {
        console.error("Error al recuperar consentimiento:", err);
      }
    };
    fetchConsent();
  }, []);

  const updateCookieConsent = () => {
    localStorage.setItem("cookie_consent", "true");
    localStorage.setItem("analytics_consent", analyticsConsent.toString());
    localStorage.setItem("ads_consent", adsConsent.toString());
    localStorage.setItem("cookie_consent_timestamp", Date.now().toString());

    consentUpdate(analyticsConsent, adsConsent);
    injectGTM();

    alert("Tus preferencias de cookies se han actualizado.");
    window.location.reload();
  };

  const handleDownloadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/privacy/download", { method: "POST" });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "mis_datos_personales.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Error al generar tus datos. Intenta más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccountWrapper = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar tu cuenta y todos tus datos? Esta acción no se puede deshacer.")) {
      setIsLoading(true);
      try {
        await onDeleteAccount();
        alert("Tu cuenta ha sido eliminada.");
      } catch (err) {
        alert("Error al procesar la solicitud. Intenta más tarde.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const fetchComplianceJson = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/assets/compliance-docs.json");
      const data = await res.json();
      setComplianceJson(data);
      setShowJson(true);
    } catch (err) {
      alert("No se pudo cargar el documento legal.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <Card sx={{ borderRadius: 4, boxShadow: "0 10px 30px rgba(0, 0, 100, 0.1)", overflow: "hidden" }}>
          <Box sx={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "white", p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ShieldCheckIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>Centro de Privacidad</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>Controla cómo recopilamos y usamos tu información</Typography>
              </Box>
            </Box>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 4 }}>
              <Tab label="Preferencias" />
              <Tab label="Solicitudes" />
              <Tab label="Documentación" />
            </Tabs>

            <AnimatePresence mode="wait">
              {activeTab === 0 && (
                <motion.div key="preferences" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <motion.div variants={itemVariants}>
                        <Card sx={{ borderRadius: 3 }}>
                          <CardContent sx={{ p: 3 }}>
                            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                              <CogIcon sx={{ verticalAlign: "middle", mr: 1 }} /> Configuración de Privacidad
                            </Typography>
                            <Box sx={{ mb: 3 }}>
                              <Paper sx={{ p: 2, mb: 2, display: "flex", alignItems: "center", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body1" fontWeight={500}>Analítica</Typography>
                                  <Typography variant="body2" color="text.secondary">Google Analytics</Typography>
                                </Box>
                                <Switch checked={analyticsConsent} onChange={() => setAnalyticsConsent(!analyticsConsent)} color="primary" />
                              </Paper>
                              <Paper sx={{ p: 2, display: "flex", alignItems: "center", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body1" fontWeight={500}>Marketing</Typography>
                                  <Typography variant="body2" color="text.secondary">Google Ads, Meta Ads</Typography>
                                </Box>
                                <Switch checked={adsConsent} onChange={() => setAdsConsent(!adsConsent)} color="primary" />
                              </Paper>
                            </Box>
                            <Button variant="contained" onClick={updateCookieConsent}>Guardar Preferencias</Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <motion.div variants={itemVariants}>
                        <Card sx={{ borderRadius: 3, height: "100%" }}>
                          <CardContent sx={{ p: 3, height: "100%" }}>
                            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                              <DocumentTextIcon sx={{ verticalAlign: "middle", mr: 1 }} /> Gestión de Datos
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <motion.div whileHover="hover" variants={hoverVariants}>
                                  <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                      <Avatar sx={{ bgcolor: "primary.light", color: "primary.main" }}><DocumentTextIcon /></Avatar>
                                      <Box>
                                        <Typography variant="body1" fontWeight={500}>Descargar mis datos</Typography>
                                        <Button variant="outlined" onClick={handleDownloadData} disabled={isLoading}>
                                          {isLoading ? "Generando..." : "Iniciar Descarga"}
                                        </Button>
                                      </Box>
                                    </Box>
                                  </Paper>
                                </motion.div>
                              </Grid>
                              <Grid item xs={12}>
                                <motion.div whileHover="hover" variants={hoverVariants}>
                                  <Paper sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "error.light", background: "rgba(239, 68, 68, 0.05)" }}>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                      <Avatar sx={{ bgcolor: "error.light", color: "error.main" }}><TrashIcon /></Avatar>
                                      <Box>
                                        <Typography variant="body1" fontWeight={500} color="error.main">Eliminar Cuenta</Typography>
                                        <Button variant="outlined" color="error" onClick={handleDeleteAccountWrapper} disabled={isLoading}>
                                          {isLoading ? "Procesando..." : "Solicitar Eliminación"}
                                        </Button>
                                      </Box>
                                    </Box>
                                  </Paper>
                                </motion.div>
                              </Grid>
                            </Grid>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {activeTab === 1 && (
                <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>Historial de Solicitudes</Typography>
                        <Button variant="contained" onClick={handleDownloadData}>Nueva Solicitud</Button>
                      </Box>
                      <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
                        <Table sx={{ minWidth: 650 }}>
                          <TableHead sx={{ bgcolor: "grey.50" }}>
                            <TableRow>
                              {["ID", "Tipo", "Fecha", "Estado"].map((header) => (
                                <TableCell key={header} sx={{ fontWeight: 600 }}>{header}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {dataRequests.map((request) => (
                              <TableRow key={request.id} sx={{ "&:nth-of-type(odd)": { bgcolor: "grey.50" } }}>
                                <TableCell>#{request.id}</TableCell>
                                <TableCell>{request.type}</TableCell>
                                <TableCell>{request.date}</TableCell>
                                <TableCell>
                                  <Chip label={request.status} color={request.status === "Completado" ? "success" : "warning"} sx={{ borderRadius: 1 }} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Paper>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 2 && (
                <motion.div key="docs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Card sx={{ borderRadius: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>Documentación Legal</Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <motion.div whileHover="hover" variants={hoverVariants}>
                            <Paper sx={{ p: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                                <DocumentTextIcon color="primary" sx={{ fontSize: 32 }} />
                                <Typography variant="h6" fontWeight={600}>Documentos Regulatorios</Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Accede a nuestros documentos de cumplimiento normativo
                              </Typography>
                              <Button variant="outlined" fullWidth onClick={fetchComplianceJson} sx={{ borderRadius: 2 }}>
                                {isLoading ? "Cargando..." : "Ver Documentación"}
                              </Button>
                            </Paper>
                          </motion.div>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <motion.div whileHover="hover" variants={hoverVariants}>
                            <Paper sx={{ p: 3, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                                <EnvelopeIcon color="primary" sx={{ fontSize: 32 }} />
                                <Typography variant="h6" fontWeight={600}>Contacto</Typography>
                              </Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                ¿Necesitas ayuda? Contácta a nuestro equipo
                              </Typography>
                              <Link href="mailto:privacy@tuempresa.com" underline="none">
                                <Button variant="outlined" fullWidth startIcon={<EnvelopeIcon />} sx={{ borderRadius: 2 }}>
                                  Enviar Email
                                </Button>
                              </Link>
                            </Paper>
                          </motion.div>
                        </Grid>
                      </Grid>
                      {showJson && complianceJson && (
                        <Paper sx={{ mt: 3, p: 3, borderRadius: 2, bgcolor: "grey.50", maxHeight: 400, overflow: "auto" }}>
                          <Typography component="pre" sx={{ fontFamily: "monospace", fontSize: "0.75rem", whiteSpace: "pre-wrap" }}>
                            {JSON.stringify(complianceJson, null, 2)}
                          </Typography>
                        </Paper>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
}