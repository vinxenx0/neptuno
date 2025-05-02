'use client'

import { useState, useEffect } from 'react'
import { Card, Title, Text, Button, Badge, Tab, TabList, TabGroup, TabPanel, TabPanels, Switch } from '@tremor/react'
import { ShieldCheckIcon, TrashIcon, CogIcon, DocumentTextIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheckIcon className="h-8 w-8 text-indigo-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Centro de Privacidad</h1>
            <p className="text-gray-500">Controla cómo recopilamos y usamos tu información</p>
          </div>
        </div>

        <TabGroup index={activeTab} onIndexChange={setActiveTab}>
          <TabList className="mb-8">
            <Tab>Preferencias</Tab>
            <Tab>Solicitudes de Datos</Tab>
            <Tab>Documentación</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="space-y-6">
                  <div>
                    <Title>Configuración de Privacidad</Title>
                    <Text>Administra tus preferencias de consentimiento</Text>
                  </div>

                  {consent ? (
                    <div className="space-y-2 mb-4">
                      <Text className="font-medium">Estado actual:</Text>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {Object.entries(consent).map(([key, value]) => (
                          <li key={key} className="flex items-center">
                            <span className="inline-block w-4 h-4 mr-2 rounded-full bg-indigo-100 flex items-center justify-center">
                              {value ? (
                                <span className="inline-block w-2 h-2 rounded-full bg-indigo-600"></span>
                              ) : null}
                            </span>
                            <span className="font-medium">{key}:</span> <span>{value ? 'Activado' : 'Desactivado'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <Text>No hemos registrado tu consentimiento aún.</Text>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Text className="font-medium">Analítica</Text>
                        <Text>Cookies de análisis (Google Analytics)</Text>
                      </div>
                      <Switch
                        checked={analyticsConsent}
                        onChange={() => setAnalyticsConsent(!analyticsConsent)}
                        color="indigo"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Text className="font-medium">Marketing</Text>
                        <Text>Cookies de publicidad (Google Ads, Meta Ads)</Text>
                      </div>
                      <Switch
                        checked={adsConsent}
                        onChange={() => setAdsConsent(!adsConsent)}
                        color="indigo"
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <Button
                      onClick={updateCookieConsent}
                      color="indigo"
                    >
                      Guardar preferencias
                    </Button>
                    <Button
                      onClick={() => window.dispatchEvent(new Event('openConsentModal'))}
                      variant="secondary"
                    >
                      Abrir banner de consentimiento
                    </Button>
                  </div>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <div className="flex items-start gap-4">
                      <div className="bg-indigo-100 p-3 rounded-full">
                        <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <Title>Solicitar mis datos</Title>
                        <Text className="mb-4">Descarga un archivo con todos tus datos personales</Text>
                        <Button 
                          variant="secondary" 
                          onClick={handleDownloadData}
                          icon={DocumentTextIcon}
                          loading={isLoading}
                        >
                          Descargar mis datos
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="border-red-100">
                    <div className="flex items-start gap-4">
                      <div className="bg-red-100 p-3 rounded-full">
                        <TrashIcon className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <Title>Eliminar mi cuenta</Title>
                        <Text className="mb-4">Esta acción eliminará permanentemente todos tus datos</Text>
                        <Button 
                          variant="light" 
                          color="red"
                          onClick={handleDeleteAccount}
                          icon={TrashIcon}
                          loading={isLoading}
                        >
                          Solicitar eliminación
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabPanel>

            <TabPanel>
              <Card>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <Title>Mis Solicitudes</Title>
                    <Text>Historial de solicitudes de datos personales</Text>
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={handleDownloadData}
                    icon={DocumentTextIcon}
                    loading={isLoading}
                  >
                    Nueva Solicitud
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <CogIcon className="h-8 w-8 animate-spin text-indigo-500" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {dataRequests.map((request) => (
                          <tr key={request.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{request.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                color={request.status === 'Completado' ? 'emerald' : 'amber'}
                                size="xs"
                              >
                                {request.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </TabPanel>

            <TabPanel>
              <Card className="space-y-6">
                <div>
                  <Title>Documentación de cumplimiento</Title>
                  <Text>Puedes consultar nuestros documentos avanzados de privacidad</Text>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                    <h3 className="text-lg font-semibold mb-2">Documentos legales</h3>
                    <p className="text-gray-600 mb-4">Registro de Actividades de Tratamiento, DPIA, política de retención y más.</p>
                    <div className="space-x-3">
                      <a
                        href="/assets/compliance-docs.json"
                        download
                        className="inline-block"
                      >
                        <Button variant="light" size="xs" icon={DocumentTextIcon}>
                          Descargar JSON
                        </Button>
                      </a>
                      <Button 
                        variant="light" 
                        size="xs" 
                        icon={DocumentTextIcon}
                        onClick={fetchComplianceJson}
                        loading={isLoading}
                      >
                        Ver en línea
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                    <h3 className="text-lg font-semibold mb-2">Contacto</h3>
                    <p className="text-gray-600 mb-4">¿Tienes preguntas sobre privacidad?</p>
                    <a href="mailto:privacy@tuempresa.com">
                      <Button variant="light" size="xs" icon={EnvelopeIcon}>
                        privacy@tuempresa.com
                      </Button>
                    </a>
                  </div>
                </div>

                {showJson && complianceJson && (
                  <div className="mt-6">
                    <Title className="mb-2">Documento de cumplimiento</Title>
                    <pre className="bg-gray-100 p-4 overflow-x-auto text-sm rounded-lg max-h-96 whitespace-pre-wrap">
                      {JSON.stringify(complianceJson, null, 2)}
                    </pre>
                  </div>
                )}
              </Card>
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  )
}