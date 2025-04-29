// lib/gtm.js
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

// Track pageviews
export const pageview = (url) => {
  window.dataLayer.push({
    event: 'pageview',
    page: url,
  });
};

// Consent update
export const consentUpdate = (granted = false) => {
  window.gtag('consent', 'update', {
    ad_storage: granted ? 'granted' : 'denied',
    analytics_storage: granted ? 'granted' : 'denied',
    functionality_storage: granted ? 'granted' : 'denied',
    personalization_storage: granted ? 'granted' : 'denied',
    security_storage: 'granted'
  });
};

// Insert GTM script dynamically
export const injectGTM = () => {
  if (document.getElementById('gtm-script')) return; // prevent duplicate
  
  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`;
  document.head.appendChild(script);

  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
  iframe.height = 0;
  iframe.width = 0;
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);
};


// --- // Google Tag Manager (GTM) / --- //

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
