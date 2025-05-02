// lib/gtm.js
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
export const CONSENT_EXPIRATION_DAYS = 180; 

// Check if consent expired
export const hasConsentExpired = () => {
  const timestamp = localStorage.getItem('cookie_consent_timestamp');
  if (!timestamp) return true;

  const savedDate = new Date(parseInt(timestamp, 10));
  const now = new Date();
  const diffDays = (now - savedDate) / (1000 * 60 * 60 * 24);

  return diffDays > CONSENT_EXPIRATION_DAYS;
};


// Track pageviews
export const pageview = (url) => {
  window.dataLayer.push({
    event: 'pageview',
    page: url,
  });
};

// Consent update
export const consentUpdate = (analytics = false, ads = false) => {
  window.gtag && window.gtag('consent', 'update', {
    ad_storage: ads ? 'granted' : 'denied',
    analytics_storage: analytics ? 'granted' : 'denied',
    functionality_storage: 'granted', // funcional siempre
    personalization_storage: ads ? 'granted' : 'denied',
    security_storage: 'granted',
  });
};

// Insert GTM script dynamically

export const injectGTM = () => {
  if (document.getElementById('gtm-script')) return;

  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.src = `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX`; // tu Measurement ID
  script.async = true;
  document.head.appendChild(script);

  const scriptInit = document.createElement('script');
  scriptInit.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXX');
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
