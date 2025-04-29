// components/CookieConsentBanner.js
// components/CookieConsentBanner.js
import { useState, useEffect } from 'react';
import { consentUpdate, injectGTM } from '../lib/gtm';

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    } else if (consent === 'true') {
      injectGTM(); // cargar si ya aceptó antes
    }
  }, []);

  const acceptCookies = () => {
    consentUpdate(true);
    localStorage.setItem('cookie_consent', 'true');
    injectGTM();
    setShowBanner(false);
  };

  const rejectCookies = () => {
    consentUpdate(false);
    localStorage.setItem('cookie_consent', 'false');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div style={styles.banner}>
      <p>Utilizamos cookies para mejorar tu experiencia. ¿Aceptas?</p>
      <button onClick={acceptCookies} style={styles.buttonAccept}>Aceptar</button>
      <button onClick={rejectCookies} style={styles.buttonReject}>Rechazar</button>
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
  }
};
