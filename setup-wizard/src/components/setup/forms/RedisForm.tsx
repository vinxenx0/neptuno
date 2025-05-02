
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";

interface RedisFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const RedisForm = ({ data, onChange }: RedisFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="input-group">
        <Label htmlFor="host" className="text-base font-medium">{t("redisHost")}</Label>
        <p className="text-sm text-slate-500 mt-1">{t("redisHostDesc")}</p>
        <Input
          id="host"
          value={data.host}
          onChange={(e) => onChange({ ...data, host: e.target.value })}
          placeholder="localhost"
        />
      </div>
      <div className="input-group">
        <Label htmlFor="port" className="text-base font-medium">{t("redisPort")}</Label>
        <p className="text-sm text-slate-500 mt-1">{t("redisPortDesc")}</p>
        <Input
          id="port"
          value={data.port}
          onChange={(e) => onChange({ ...data, port: e.target.value })}
          placeholder="6379"
        />
      </div>
    </div>
  );
};
