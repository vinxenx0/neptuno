
import { useTranslation } from "@/hooks/useTranslation";

export const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="w-full border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container py-4 text-center text-sm text-slate-600">
        <p>© {new Date().getFullYear()} Neptuno Setup Wizard. {t("allRightsReserved")}</p>
      </div>
    </footer>
  );
};
