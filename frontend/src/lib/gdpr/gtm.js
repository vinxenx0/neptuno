// lib/gtm.js
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
export const CONSENT_EXPIRATION_DAYS = 180; 


// Obtener consentimiento almacenado desde localStorage
export const getStoredConsent = () => {
  return {
    analytics: localStorage.getItem('analytics_consent') === 'true',
    ads: localStorage.getItem('ads_consent') === 'true',
    timestamp: localStorage.getItem('cookie_consent_timestamp'),
    valid: localStorage.getItem('cookie_consent') === 'true'
  };
};

// Guardar consentimiento en localStorage
export const setStoredConsent = (analytics, ads) => {
  const consentData = {
    ad_storage: ads ? 'granted' : 'denied',
    analytics_storage: analytics ? 'granted' : 'denied'
  };

  localStorage.setItem('cookie_consent', 'true');
  localStorage.setItem('analytics_consent', analytics.toString());
  localStorage.setItem('ads_consent', ads.toString());
  localStorage.setItem('cookieConsent', JSON.stringify(consentData));
  localStorage.setItem('cookie_consent_timestamp', Date.now().toString());
};

// Verificar si expiró el consentimiento
export const hasConsentExpired = () => {
  const timestamp = localStorage.getItem('cookie_consent_timestamp');
  if (!timestamp) return true;

  const savedDate = new Date(parseInt(timestamp, 10));
  const now = new Date();
  const diffDays = (now.getTime() - savedDate.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays > CONSENT_EXPIRATION_DAYS;
};

// Reportar visualización de página
export const pageview = (url) => {
  window.dataLayer?.push({
    event: 'pageview',
    page: url,
  });
};

// Actualizar consentimiento en gtag
export const consentUpdate = (analytics = false, ads = false) => {
  window.gtag?.('consent', 'update', {
    ad_storage: ads ? 'granted' : 'denied',
    analytics_storage: analytics ? 'granted' : 'denied',
    functionality_storage: 'granted',
    personalization_storage: ads ? 'granted' : 'denied',
    security_storage: 'granted',
  });
};

// Inyectar GTM dinámicamente según consentimiento almacenado
export const injectGTM = () => {
  if (!GTM_ID) {
    console.warn('GTM_ID no definido');
    return;
  }

  if (document.getElementById('gtm-script')) return;

  const { analytics, ads } = getStoredConsent();

  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GTM_ID}`;
  script.async = true;
  document.head.appendChild(script);

  const scriptInit = document.createElement('script');
  scriptInit.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GTM_ID}');
    gtag('consent', 'default', {
      ad_storage: '${ads ? 'granted' : 'denied'}',
      analytics_storage: '${analytics ? 'granted' : 'denied'}',
      functionality_storage: 'granted',
      personalization_storage: '${ads ? 'granted' : 'denied'}',
      security_storage: 'granted'
    });
  `;
  document.head.appendChild(scriptInit);
};


// --- Sin aplicar solo definido --- //

// Event tracking
export const event = ({ action, category, label, value }) => {
  window.dataLayer.push({
    event: 'event-to-ga',
    action,
    category,
    label,
    value,
  });
};
// Event tracking with gtag
export const gtagEvent = ({ action, category, label, value }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
};
// Event tracking with gtag and custom parameters
export const gtagEventWithParams = ({ action, category, label, value, params }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
    ...params,
  });
};
// Event tracking with gtag and custom parameters
export const gtagEventWithParamsAndCallback = ({ action, category, label, value, params, callback }) => {
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
    ...params,
  }, callback);
};
