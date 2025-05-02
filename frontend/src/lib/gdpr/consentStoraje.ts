export function getConsentFromStorage() {
    return {
      analytics: localStorage.getItem('analytics_consent') === 'true',
      ads: localStorage.getItem('ads_consent') === 'true',
      cookie: localStorage.getItem('cookie_consent'),
      timestamp: localStorage.getItem('cookie_consent_timestamp')
    };
  }
  
  export function saveConsentToStorage(analytics: boolean, ads: boolean) {
    const data = {
      ad_storage: ads ? 'granted' : 'denied',
      analytics_storage: analytics ? 'granted' : 'denied'
    };
  
    localStorage.setItem('cookie_consent', 'true');
    localStorage.setItem('analytics_consent', analytics.toString());
    localStorage.setItem('ads_consent', ads.toString());
    localStorage.setItem('cookieConsent', JSON.stringify(data));
    localStorage.setItem('cookie_consent_timestamp', Date.now().toString());
  }
  