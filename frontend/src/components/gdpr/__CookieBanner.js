// components/CookieBanner.tsx
'use client';

import { useState, useEffect } from 'react'

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [showReopenButton, setShowReopenButton] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      setShowBanner(true)
    } else {
      setShowReopenButton(true)
    }
  }, [])

  const acceptAll = () => {
    updateConsent({
      ad_storage: 'granted',
      analytics_storage: 'granted',
      functionality_storage: 'granted',
      personalization_storage: 'granted',
      security_storage: 'granted',
    })
  }

  const rejectAll = () => {
    updateConsent({
      ad_storage: 'denied',
      analytics_storage: 'denied',
      functionality_storage: 'denied',
      personalization_storage: 'denied',
      security_storage: 'granted',
    })
  }

  const updateConsent = (categories) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', categories)
    }
    localStorage.setItem('cookie-consent', JSON.stringify(categories))
    setShowBanner(false)
    setShowReopenButton(true)
  }

  const reopenBanner = () => {
    setShowBanner(true)
  }

  if (!showBanner && !showReopenButton) return null

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-md z-50">
          <h2 className="text-lg font-semibold">Gestiona tus preferencias de cookies</h2>
          <p className="text-sm mb-2">
            Usamos cookies para personalizar contenido y anuncios, ofrecer funciones de redes sociales y analizar nuestro tráfico.
          </p>
          <div className="flex gap-4 mt-4">
            <button onClick={acceptAll} className="bg-green-600 text-white py-2 px-4 rounded">
              Aceptar todo
            </button>
            <button onClick={rejectAll} className="bg-red-500 text-white py-2 px-4 rounded">
              Rechazar todo
            </button>
          </div>
        </div>
      )}

      {showReopenButton && !showBanner && (
        <div className="fixed bottom-4 right-4">
          <button
            onClick={reopenBanner}
            className="bg-gray-800 text-white py-2 px-4 rounded text-sm shadow-md"
          >
            Gestionar cookies
          </button>
        </div>
      )}
    </>
  )
}

export default CookieBanner
