// frontend/src/components/gdpr/PrivacyCenter.tsx
'use client'

import { useState, useEffect } from 'react'
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
  CircularProgress,
  Paper,
  Divider,
  Link
} from '@mui/material'
import { 
  Shield as ShieldCheckIcon, 
  Delete as TrashIcon, 
  Settings as CogIcon, 
  Description as DocumentTextIcon, 
  Mail as EnvelopeIcon 
} from '@mui/icons-material'

export default function PrivacyCenter() {
  const [activeTab, setActiveTab] = useState(0)
  const [consent, setConsent] = useState(null)
  const [complianceJson, setComplianceJson] = useState(null)
  const [showJson, setShowJson] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dataRequests, setDataRequests] = useState([])
  
  // Estado para controles de consentimiento
  const [analyticsConsent, setAnalyticsConsent] = useState(false)
  const [adsConsent, setAdsConsent] = useState(false)

  // Cargar consentimiento almacenado
  useEffect(() => {
    setIsLoading(true)
    const stored = localStorage.getItem('cookie_consent')
    const analytics = localStorage.getItem('analytics_consent') === 'true'
    const ads = localStorage.getItem('ads_consent') === 'true'
    
    if (stored) {
      setConsent({
        cookie_consent: stored,
        analytics_consent: analytics,
        ads_consent: ads
      })
      setAnalyticsConsent(analytics)
      setAdsConsent(ads)
    }
    
    // Simular carga de solicitudes de datos
    setTimeout(() => {
      setDataRequests([
        { id: 1, type: 'Datos personales', date: new Date().toISOString().split('T')[0], status: 'Completado' }
      ])
      setIsLoading(false)
    }, 800)
  }, [])

  // Obtener consentimiento del backend
  useEffect(() => {
    const fetchConsent = async () => {
      try {
        const res = await fetch('/api/privacy?userId=usuario123') // Simulado
        if (res.ok) {
          const data = await res.json()
          setConsent(data.consentData)
        }
      } catch (err) {
        console.error('Error al recuperar consentimiento:', err)
      }
    }
    fetchConsent()
  }, [])

  const updateCookieConsent = () => {
    localStorage.setItem('cookie_consent', 'true')
    localStorage.setItem('analytics_consent', analyticsConsent.toString())
    localStorage.setItem('ads_consent', adsConsent.toString())
    localStorage.setItem('cookie_consent_timestamp', Date.now().toString())

    alert('Tus preferencias de cookies se han actualizado.')
    window.location.reload() // Opcional para reinicializar GTM
  }

  const handleDownloadData = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/privacy/download', { method: 'POST' })
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'mis_datos_personales.json'
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert('Error al generar tus datos. Intenta más tarde.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta y todos tus datos? Esta acción no se puede deshacer.')) {
      setIsLoading(true)
      try {
        await fetch('/api/privacy/delete', { method: 'POST' })
        alert('Tu solicitud de eliminación fue recibida. Serás notificado.')
      } catch (err) {
        alert('Error al procesar la solicitud. Intenta más tarde.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const fetchComplianceJson = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/assets/compliance-docs.json')
      const data = await res.json()
      setComplianceJson(data)
      setShowJson(true)
    } catch (err) {
      alert('No se pudo cargar el documento legal.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'grey.50', p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: '1536px', mx: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <ShieldCheckIcon color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'grey.900' }}>
              Centro de Privacidad
            </Typography>
            <Typography color="text.secondary">
              Controla cómo recopilamos y usamos tu información
            </Typography>
          </Box>
        </Box>

        <Box>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 4 }}>
            <Tab label="Preferencias" />
            <Tab label="Solicitudes de Datos" />
            <Tab label="Documentación" />
          </Tabs>

          <Box sx={{ mt: 2 }}>
            {activeTab === 0 && (
              <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 3 }}>
                <Card>
                  <CardContent sx={{ '& > * + *': { mt: 3 } }}>
                    <Box>
                      <Typography variant="h5" component="h2">
                        Configuración de Privacidad
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Administra tus preferencias de consentimiento
                      </Typography>
                    </Box>

                    {consent ? (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Estado actual:
                        </Typography>
                        <Box component="ul" sx={{ listStyle: 'none', pl: 0, '& > li + li': { mt: 1 } }}>
                          {Object.entries(consent).map(([key, value]) => (
                            <Box component="li" key={key} sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ 
                                width: 16, 
                                height: 16, 
                                mr: 1, 
                                borderRadius: '50%', 
                                bgcolor: 'primary.light',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {value && (
                                  <Box sx={{ 
                                    width: 8, 
                                    height: 8, 
                                    borderRadius: '50%', 
                                    bgcolor: 'primary.main' 
                                  }} />
                                )}
                              </Box>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {key}: <span>{value ? 'Activado' : 'Desactivado'}</span>
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      <Typography variant="body2">
                        No hemos registrado tu consentimiento aún.
                      </Typography>
                    )}

                    <Box sx={{ '& > * + *': { mt: 2 } }}>
                      <Paper elevation={0} sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            Analítica
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cookies de análisis (Google Analytics)
                          </Typography>
                        </Box>
                        <Switch
                          checked={analyticsConsent}
                          onChange={() => setAnalyticsConsent(!analyticsConsent)}
                          color="primary"
                        />
                      </Paper>

                      <Paper elevation={0} sx={{ 
                        p: 2, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            Marketing
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cookies de publicidad (Google Ads, Meta Ads)
                          </Typography>
                        </Box>
                        <Switch
                          checked={adsConsent}
                          onChange={() => setAdsConsent(!adsConsent)}
                          color="primary"
                        />
                      </Paper>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                      <Button
                        onClick={updateCookieConsent}
                        variant="contained"
                        color="primary"
                      >
                        Guardar preferencias
                      </Button>
                      <Button
                        onClick={() => window.dispatchEvent(new Event('openConsentModal'))}
                        variant="outlined"
                      >
                        Abrir banner de consentimiento
                      </Button>
                    </Box>
                  </CardContent>
                </Card>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Card>
                    <CardContent sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ 
                        bgcolor: 'primary.light', 
                        p: 1.5, 
                        borderRadius: '50%',
                        color: 'primary.main'
                      }}>
                        <DocumentTextIcon />
                      </Box>
                      <Box>
                        <Typography variant="h5" component="h3">
                          Solicitar mis datos
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Descarga un archivo con todos tus datos personales
                        </Typography>
                        <Button 
                          variant="outlined"
                          onClick={handleDownloadData}
                          startIcon={<DocumentTextIcon />}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Cargando...' : 'Descargar mis datos'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>

                  <Card sx={{ borderColor: 'error.light' }}>
                    <CardContent sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      gap: 2,
                      borderLeft: '4px solid',
                      borderColor: 'error.main'
                    }}>
                      <Box sx={{ 
                        bgcolor: 'error.light', 
                        p: 1.5, 
                        borderRadius: '50%',
                        color: 'error.main'
                      }}>
                        <TrashIcon />
                      </Box>
                      <Box>
                        <Typography variant="h5" component="h3">
                          Eliminar mi cuenta
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Esta acción eliminará permanentemente todos tus datos
                        </Typography>
                        <Button 
                          variant="outlined"
                          color="error"
                          onClick={handleDeleteAccount}
                          startIcon={<TrashIcon />}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Procesando...' : 'Solicitar eliminación'}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            )}

            {activeTab === 1 && (
              <Card>
                <CardContent>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mb: 3
                  }}>
                    <Box>
                      <Typography variant="h5" component="h2">
                        Mis Solicitudes
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Historial de solicitudes de datos personales
                      </Typography>
                    </Box>
                    <Button 
                      variant="contained"
                      onClick={handleDownloadData}
                      startIcon={<DocumentTextIcon />}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Cargando...' : 'Nueva Solicitud'}
                    </Button>
                  </Box>

                  {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                      <CircularProgress color="primary" />
                    </Box>
                  ) : (
                    <Box sx={{ overflowX: 'auto' }}>
                      <Table>
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'medium' }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 'medium' }}>Tipo</TableCell>
                            <TableCell sx={{ fontWeight: 'medium' }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 'medium' }}>Estado</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {dataRequests.map((request) => (
                            <TableRow key={request.id}>
                              <TableCell>#{request.id}</TableCell>
                              <TableCell>{request.type}</TableCell>
                              <TableCell>{request.date}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={request.status}
                                  color={request.status === 'Completado' ? 'success' : 'warning'}
                                  size="small"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 2 && (
              <Card>
                <CardContent sx={{ '& > * + *': { mt: 3 } }}>
                  <Box>
                    <Typography variant="h5" component="h2">
                      Documentación de cumplimiento
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Puedes consultar nuestros documentos avanzados de privacidad
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 1fr' }, gap: 3 }}>
                    <Paper elevation={0} sx={{ 
                      p: 3, 
                      border: '1px solid', 
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'grey.50' }
                    }}>
                      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                        Documentos legales
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Registro de Actividades de Tratamiento, DPIA, política de retención y más.
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Link href="/assets/compliance-docs.json" download>
                          <Button 
                            variant="outlined" 
                            size="small"
                            startIcon={<DocumentTextIcon />}
                          >
                            Descargar JSON
                          </Button>
                        </Link>
                        <Button 
                          variant="outlined" 
                          size="small"
                          startIcon={<DocumentTextIcon />}
                          onClick={fetchComplianceJson}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Cargando...' : 'Ver en línea'}
                        </Button>
                      </Box>
                    </Paper>

                    <Paper elevation={0} sx={{ 
                      p: 3, 
                      border: '1px solid', 
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'grey.50' }
                    }}>
                      <Typography variant="h6" component="h3" sx={{ mb: 1 }}>
                        Contacto
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        ¿Tienes preguntas sobre privacidad?
                      </Typography>
                      <Link href="mailto:privacy@tuempresa.com" underline="none">
                        <Button 
                          variant="outlined" 
                          size="small"
                          startIcon={<EnvelopeIcon />}
                        >
                          privacy@tuempresa.com
                        </Button>
                      </Link>
                    </Paper>
                  </Box>

                  {showJson && complianceJson && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h5" component="h2" sx={{ mb: 1 }}>
                        Documento de cumplimiento
                      </Typography>
                      <Paper elevation={0} sx={{ 
                        p: 2, 
                        bgcolor: 'grey.100', 
                        overflow: 'auto',
                        maxHeight: 400,
                        whiteSpace: 'pre-wrap'
                      }}>
                        <Typography component="pre" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                          {JSON.stringify(complianceJson, null, 2)}
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}