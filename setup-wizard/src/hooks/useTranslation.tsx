
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { enTranslations } from '@/locales/en';
import { esTranslations } from '@/locales/es';

interface TranslationContextType {
  t: (key: string) => string;
  currentLang: string;
  setCurrentLang: (lang: string) => void;
}

const TranslationContext = createContext<TranslationContextType>({
  t: () => '',
  currentLang: 'en',
  setCurrentLang: () => {},
});

export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [currentLang, setCurrentLang] = useState('en');

  const t = (key: string): string => {
    const translations = currentLang === 'en' ? enTranslations : esTranslations;
    return translations[key] || key;
  };

  return (
    <TranslationContext.Provider value={{ t, currentLang, setCurrentLang }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => useContext(TranslationContext);
