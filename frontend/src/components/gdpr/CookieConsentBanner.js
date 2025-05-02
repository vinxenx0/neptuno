// components/CookieConsentBanner.js
import { useState, useEffect } from 'react';
import { consentUpdate, injectGTM, hasConsentExpired } from '../../lib/gdpr/gtm';


export default function CookieConsentBanner({ forceShow = false, onClose, onShow }) {
  const [showBanner, setShowBanner] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [adsConsent, setAdsConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    const expired = hasConsentExpired();
  
    const analytics = localStorage.getItem('analytics_consent') === 'true';
    const ads = localStorage.getItem('ads_consent') === 'true';
    setAnalyticsConsent(analytics);
    setAdsConsent(ads);
  
    if (forceShow || !consent || expired) {
      setShowBanner(true);
      onShow?.();
    } else if (consent === 'true') {
      injectGTM();
    }
  }, [forceShow, onShow]);
  

  useEffect(() => {
    const handleOpenBanner = () => {
      setShowBanner(true);
      onShow?.();
    };
    window.addEventListener('openConsentModal', handleOpenBanner);
    return () => window.removeEventListener('openConsentModal', handleOpenBanner);
  }, []);

  const closeBanner = () => {
    setShowBanner(false);
    onClose?.();
  };

  const saveConsent = async () => {
    const consentData = {
      ad_storage: adsConsent ? 'granted' : 'denied',
      analytics_storage: analyticsConsent ? 'granted' : 'denied'
    };

    consentUpdate(analyticsConsent, adsConsent);
    localStorage.setItem('cookie_consent', 'true');
    localStorage.setItem('analytics_consent', analyticsConsent);
    localStorage.setItem('ads_consent', adsConsent);
    localStorage.setItem('cookieConsent', JSON.stringify(consentData));
    localStorage.setItem('cookie_consent_timestamp', Date.now().toString());

    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usuario123',
          consentData,
        }),
      });
    } catch (err) {
      console.error('Error al guardar consentimiento:', err);
    }

    injectGTM();
    closeBanner();
  };

  if (!showBanner) return null;

  return (
    <div style={styles.banner}>
      <div>
        <p>Utilizamos cookies para mejorar tu experiencia:</p>
        <div>
          <label>
            <input
              type="checkbox"
              checked={analyticsConsent}
              onChange={() => setAnalyticsConsent(!analyticsConsent)}
            /> Aceptar cookies de análisis (Google Analytics)
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={adsConsent}
              onChange={() => setAdsConsent(!adsConsent)}
            /> Aceptar cookies de marketing (Google Ads, Facebook Ads)
          </label>
        </div>
      </div>
      <button onClick={saveConsent} style={styles.buttonAccept}>Guardar Preferencias</button>
      <button onClick={() => {
        consentUpdate(false, false);
        localStorage.setItem('cookie_consent', 'false');
        localStorage.setItem('cookie_consent_timestamp', Date.now().toString());
        closeBanner();
      }} style={styles.buttonReject}>
        Rechazar Todo
      </button>
    </div>
  );
}



const styles = {
  banner: {
    position: 'fixed',
    bottom: 0,
    width: '100%',
    background: '#fff',
    padding: '10px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: '0px -2px 10px rgba(0,0,0,0.1)',
    zIndex: 9999,
  },
  buttonAccept: {
    padding: '8px 12px',
    background: 'green',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
  },
  buttonReject: {
    padding: '8px 12px',
    background: 'red',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
  },
  buttonClose: {
    padding: '8px 12px',
    background: 'gray',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
  }
};

