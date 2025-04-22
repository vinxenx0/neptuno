
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";

interface EnvironmentFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const EnvironmentForm = ({ data, onChange }: EnvironmentFormProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="input-group">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="debug" className="text-base font-medium">{t("enableDebugMode")}</Label>
            <p className="text-sm text-slate-500 mt-1">{t("enableDebugModeDesc")}</p>
          </div>
          <Switch
            id="debug"
            checked={data.debug}
            onCheckedChange={(checked) => onChange({ ...data, debug: checked })}
            className="data-[state=checked]:bg-accent"
          />
        </div>
      </div>

      <div className="input-group">
        <Label htmlFor="mode" className="text-base font-medium">Environment Mode</Label>
        <p className="text-sm text-slate-500 mt-1">Select the environment mode for deployment</p>
        <Select
          value={data.mode}
          onValueChange={(value) => onChange({ ...data, mode: value })}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select environment mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="development">Development</SelectItem>
            <SelectItem value="production">Production</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
