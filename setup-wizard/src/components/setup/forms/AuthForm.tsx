
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";

interface AuthFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const AuthForm = ({ data, onChange }: AuthFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="input-group">
        <Label htmlFor="googleCustomerId" className="text-base font-medium">{t("googleCustomerId")}</Label>
        <p className="text-sm text-slate-500 mt-1">{t("googleOAuthClientId")}</p>
        <Input
          id="googleCustomerId"
          value={data.googleCustomerId}
          onChange={(e) => onChange({ ...data, googleCustomerId: e.target.value })}
          placeholder={t("yourGoogleCustomerId")}
        />
      </div>
      <div className="input-group">
        <Label htmlFor="googleCustomerSecret" className="text-base font-medium">{t("googleCustomerSecret")}</Label>
        <p className="text-sm text-slate-500 mt-1">{t("googleOAuthClientSecret")}</p>
        <Input
          id="googleCustomerSecret"
          type="password"
          value={data.googleCustomerSecret}
          onChange={(e) => onChange({ ...data, googleCustomerSecret: e.target.value })}
          placeholder={t("yourGoogleCustomerSecret")}
        />
      </div>
      <div className="input-group">
        <Label htmlFor="googleRedirectUri" className="text-base font-medium">{t("googleRedirectUri")}</Label>
        <p className="text-sm text-slate-500 mt-1">{t("googleOAuthRedirectUri")}</p>
        <Input
          id="googleRedirectUri"
          value={data.googleRedirectUri}
          onChange={(e) => onChange({ ...data, googleRedirectUri: e.target.value })}
          placeholder="http://localhost:8000/v1/auth/login/google/callback"
        />
      </div>
      <div className="input-group">
        <Label htmlFor="metaClientId" className="text-base font-medium">{t("metaClientId")}</Label>
        <p className="text-sm text-slate-500 mt-1">{t("metaOAuthClientId")}</p>
        <Input
          id="metaClientId"
          value={data.metaClientId}
          onChange={(e) => onChange({ ...data, metaClientId: e.target.value })}
          placeholder={t("yourMetaClientId")}
        />
      </div>
      <div className="input-group">
        <Label htmlFor="metaClientSecret" className="text-base font-medium">{t("metaClientSecret")}</Label>
        <p className="text-sm text-slate-500 mt-1">{t("metaOAuthClientSecret")}</p>
        <Input
          id="metaClientSecret"
          type="password"
          value={data.metaClientSecret}
          onChange={(e) => onChange({ ...data, metaClientSecret: e.target.value })}
          placeholder={t("yourMetaClientSecret")}
        />
      </div>
      <div className="input-group">
        <Label htmlFor="metaRedirectUri" className="text-base font-medium">{t("metaRedirectUri")}</Label>
        <p className="text-sm text-slate-500 mt-1">{t("metaOAuthRedirectUri")}</p>
        <Input
          id="metaRedirectUri"
          value={data.metaRedirectUri}
          onChange={(e) => onChange({ ...data, metaRedirectUri: e.target.value })}
          placeholder="http://localhost:8000/v1/auth/login/meta/callback"
        />
      </div>
    </div>
  );
};
