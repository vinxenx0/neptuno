
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ServerFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const ServerForm = ({ data, onChange }: ServerFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">{t("databaseConfiguration")}</h3>
        <div className="space-y-4">
          <div className="input-group">
            <Label htmlFor="dbType" className="text-base font-medium mb-1 block">{t("databaseType")}</Label>
            <p className="text-sm text-slate-500 mb-2">{t("databaseEngineType")}</p>
            <Select value={data.dbType} onValueChange={(value) => onChange({ ...data, dbType: value })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectDatabaseType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postgres" className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" /> PostgreSQL
                </SelectItem>
                <SelectItem value="mysql" className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-orange-500" /> MySQL
                </SelectItem>
                <SelectItem value="mongodb" className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-green-500" /> MongoDB
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="input-group">
            <Label htmlFor="dbHost" className="text-base font-medium mb-1 block">{t("databaseHost")}</Label>
            <p className="text-sm text-slate-500 mb-2">{t("databaseServerHostname")}</p>
            <Input
              id="dbHost"
              value={data.dbHost}
              onChange={(e) => onChange({ ...data, dbHost: e.target.value })}
              placeholder="localhost"
              className="border-slate-300 focus:border-accent focus:ring-accent"
            />
          </div>

          <div className="input-group">
            <Label htmlFor="dbPort" className="text-base font-medium mb-1 block">{t("databasePort")}</Label>
            <p className="text-sm text-slate-500 mb-2">{t("databaseServerPort")}</p>
            <Input
              id="dbPort"
              value={data.dbPort}
              onChange={(e) => onChange({ ...data, dbPort: e.target.value })}
              placeholder="5432"
              className="border-slate-300 focus:border-accent focus:ring-accent"
            />
          </div>

          <div className="input-group">
            <Label htmlFor="dbUser" className="text-base font-medium mb-1 block">{t("databaseUser")}</Label>
            <p className="text-sm text-slate-500 mb-2">{t("databaseUsername")}</p>
            <Input
              id="dbUser"
              value={data.dbUser}
              onChange={(e) => onChange({ ...data, dbUser: e.target.value })}
              placeholder="user"
              className="border-slate-300 focus:border-accent focus:ring-accent"
            />
          </div>

          <div className="input-group">
            <Label htmlFor="dbPassword" className="text-base font-medium mb-1 block">{t("databasePassword")}</Label>
            <p className="text-sm text-slate-500 mb-2">{t("databasePasswordDesc")}</p>
            <Input
              id="dbPassword"
              type="password"
              value={data.dbPassword}
              onChange={(e) => onChange({ ...data, dbPassword: e.target.value })}
              placeholder={t("enterDatabasePassword")}
              className="border-slate-300 focus:border-accent focus:ring-accent"
            />
          </div>

          <div className="input-group">
            <Label htmlFor="dbName" className="text-base font-medium mb-1 block">{t("databaseName")}</Label>
            <p className="text-sm text-slate-500 mb-2">{t("databaseNameDesc")}</p>
            <Input
              id="dbName"
              value={data.dbName}
              onChange={(e) => onChange({ ...data, dbName: e.target.value })}
              placeholder={t("enterDatabaseName")}
              className="border-slate-300 focus:border-accent focus:ring-accent"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
