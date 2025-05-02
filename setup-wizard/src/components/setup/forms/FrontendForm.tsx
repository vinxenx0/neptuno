
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTranslation } from "@/hooks/useTranslation";

interface FrontendFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const FrontendForm = ({ data, onChange }: FrontendFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="input-group">
        <Label htmlFor="url" className="text-base font-medium">{t("frontendURL")}</Label>
        <p className="text-sm text-slate-500 mt-1">{t("frontendURLDesc")}</p>
        <Input
          id="url"
          value={data.url}
          onChange={(e) => onChange({ ...data, url: e.target.value })}
          placeholder="http://localhost:3000"
        />
      </div>
      <div className="input-group">
        <Label htmlFor="host" className="text-base font-medium">{t("frontendHost")}</Label>
        <p className="text-sm text-slate-500 mt-1">{t("frontendHostDesc")}</p>
        <Input
          id="host"
          value={data.host}
          onChange={(e) => onChange({ ...data, host: e.target.value })}
          placeholder="localhost"
        />
      </div>
      <div className="input-group">
        <Label htmlFor="publicApiUrl" className="text-base font-medium">{t("publicApiURL")}</Label>
        <p className="text-sm text-slate-500 mt-1">{t("publicApiURLDesc")}</p>
        <Input
          id="publicApiUrl"
          value={data.publicApiUrl}
          onChange={(e) => onChange({ ...data, publicApiUrl: e.target.value })}
          placeholder="http://127.0.0.1:8000/"
        />
      </div>
      <div className="input-group">
        <Label htmlFor="secretKey" className="text-base font-medium">{t("secretKey")}</Label>
        <p className="text-sm text-slate-500 mt-1">{t("secretKeyDesc")}</p>
        <Input
          id="secretKey"
          type="password"
          value={data.secretKey}
          onChange={(e) => onChange({ ...data, secretKey: e.target.value })}
          placeholder={t("yourSecretKey")}
        />
      </div>
      <div className="input-group">
        <Label htmlFor="desktop" className="text-base font-medium mb-1 block">{t("desktopFramework")}</Label>
        <p className="text-sm text-slate-500 mb-2">{t("desktopFrameworkDesc")}</p>
        <ToggleGroup
          type="single"
          value={data.desktop}
          onValueChange={(value) => value && onChange({ ...data, desktop: value })}
          className="flex w-full border rounded-md overflow-hidden"
        >
          <ToggleGroupItem
            value="REACT"
            aria-label="React"
            className="flex-1 data-[state=on]:bg-accent data-[state=on]:text-white py-2"
          >
            React
          </ToggleGroupItem>
          <ToggleGroupItem
            value="NEXT"
            aria-label="Next.js"
            className="flex-1 data-[state=on]:bg-accent data-[state=on]:text-white py-2"
          >
            Next.js
          </ToggleGroupItem>
          <ToggleGroupItem
            value="VITE"
            aria-label="Vite"
            className="flex-1 data-[state=on]:bg-accent data-[state=on]:text-white py-2"
          >
            Vite
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};
