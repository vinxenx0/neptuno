// frontend/src/components/gdpr/PrivacyCenter.js
'use client';

import { useState, useEffect } from 'react';

export default function PrivacyCenter() {
  const [consent, setConsent] = useState(null);
  const [complianceJson, setComplianceJson] = useState(null);
  const [showJson, setShowJson] = useState(false);

  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [adsConsent, setAdsConsent] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('cookie_consent');
    const analytics = localStorage.getItem('analytics_consent') === 'true';
    const ads = localStorage.getItem('ads_consent') === 'true';
    if (stored) {
      setConsent({
        cookie_consent: stored,
        analytics_consent: analytics,
        ads_consent: ads
      });
      setAnalyticsConsent(analytics);
      setAdsConsent(ads);
    }
  }, []);

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
    localStorage.setItem('cookie_consent', 'true');
    localStorage.setItem('analytics_consent', analyticsConsent);
    localStorage.setItem('ads_consent', adsConsent);
    localStorage.setItem('cookie_consent_timestamp', Date.now().toString());

    alert('Tus preferencias de cookies se han actualizado.');
    window.location.reload(); // Opcional para reinicializar GTM
  };


  const handleDownloadData = async () => {
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
    }
  }

  const handleDeleteAccount = async () => {
    try {
      await fetch('/api/privacy/delete', { method: 'POST' })
      alert('Tu solicitud de eliminación fue recibida. Serás notificado.')
    } catch (err) {
      alert('Error al procesar la solicitud. Intenta más tarde.')
    }
  }

  const fetchComplianceJson = async () => {
    try {
      const res = await fetch('/assets/compliance-docs.json')
      const data = await res.json()
      setComplianceJson(data)
      setShowJson(true)
    } catch (err) {
      alert('No se pudo cargar el documento legal.')
    }
  }

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Centro de Privacidad</h1>

      <section className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">Tus preferencias de consentimiento</h2>
        {consent ? (
          <ul className="space-y-1">
            {Object.entries(consent).map(([key, value]) => (
              <li key={key}>
                <span className="font-medium">{key}:</span> <span>{value ? 'Sí' : 'No'}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hemos registrado tu consentimiento aún.</p>
        )}

        <div className="mt-4 space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={analyticsConsent}
              onChange={() => setAnalyticsConsent(!analyticsConsent)}
            />
            <span>Aceptar cookies de análisis (Google Analytics)</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={adsConsent}
              onChange={() => setAdsConsent(!adsConsent)}
            />
            <span>Aceptar cookies de marketing (Google Ads, Meta Ads)</span>
          </label>
        </div>

        <div className="mt-4 flex space-x-3">
          <button
            onClick={updateCookieConsent}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Guardar preferencias
          </button>
          <button
            onClick={() => window.dispatchEvent(new Event('openConsentModal'))}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Abrir banner de consentimiento
          </button>
        </div>
      </section>

      <section className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">Gestión de datos personales</h2>
        <p className="mb-2 text-sm text-gray-600">
          Según el Reglamento (UE) 2016/679 (GDPR) y leyes similares, tienes derecho a acceder, rectificar y eliminar tus datos.
        </p>
        <div className="space-x-3">
          <button
            onClick={handleDownloadData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Descargar mis datos
          </button>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Solicitar eliminación
          </button>
        </div>
      </section>

      <section className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">Documentación de cumplimiento</h2>
        <p className="mb-2 text-sm text-gray-600">
          Puedes consultar nuestros documentos avanzados de privacidad, incluyendo el Registro de Actividades de Tratamiento, DPIA, política de retención y más.
        </p>
        <div className="space-x-3">
          <a
            href="/assets/compliance-docs.json"
            download
            className="inline-block bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Descargar JSON
          </a>
          <button
            onClick={fetchComplianceJson}
            className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Ver en línea
          </button>
        </div>
        {showJson && complianceJson && (
          <pre className="mt-4 bg-gray-100 p-3 overflow-x-auto text-sm rounded-lg max-h-96 whitespace-pre-wrap">
            {JSON.stringify(complianceJson, null, 2)}
          </pre>
        )}
      </section>

      <section className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">¿Tienes preguntas?</h2>
        <p>Contáctanos en <a href="mailto:privacy@tuempresa.com" className="text-blue-600 underline">privacy@tuempresa.com</a></p>
      </section>
    </main>
  )
}
