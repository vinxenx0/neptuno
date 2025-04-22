
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

interface HeaderProps {
  onLanguageChange: (lang: string) => void;
}

export const Header = ({ onLanguageChange }: HeaderProps) => {
  const { t, currentLang, setCurrentLang } = useTranslation();

  const handleLanguageChange = (value: string) => {
    setCurrentLang(value);
    onLanguageChange(value);
  };

  return (
    <header className="w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <Globe className="h-6 w-6 text-accent" />
          <h1 className="text-2xl font-bold gradient-text">Neptuno Setup</h1>
        </div>
        <div className="flex items-center gap-4">
          <Select value={currentLang} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder={t("language")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
};
