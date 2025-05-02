// src/hooks/useCookieConsent.ts

// Para el botón GDPR:
// const { rejectAll } = useCookieConsent();
// <button onClick={rejectAll}>No vender ni compartir mi información</button>

import { useEffect, useState } from "react";

type ConsentState = {
  cookie: boolean;
  analytics: boolean;
  ads: boolean;
};

const defaultConsent: ConsentState = {
  cookie: false,
  analytics: false,
  ads: false,
};

export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(defaultConsent);

  useEffect(() => {
    const stored = {
      cookie: localStorage.getItem("cookie_consent") === "true",
      analytics: localStorage.getItem("analytics_consent") === "true",
      ads: localStorage.getItem("ads_consent") === "true",
    };
    setConsent(stored);
  }, []);

  const updateConsent = (newConsent: ConsentState) => {
    setConsent(newConsent);
    localStorage.setItem("cookie_consent", String(newConsent.cookie));
    localStorage.setItem("analytics_consent", String(newConsent.analytics));
    localStorage.setItem("ads_consent", String(newConsent.ads));
    localStorage.setItem("cookie_consent_timestamp", Date.now().toString());
  };

  const rejectAll = () => {
    updateConsent({ cookie: false, analytics: false, ads: false });
  };

  return { consent, updateConsent, rejectAll };
}
