
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { Globe, User, Lock, Folder } from "lucide-react";

interface EnvironmentFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const EnvironmentForm = ({ data, onChange }: EnvironmentFormProps) => {
  const { t } = useTranslation();

  const handleChange = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

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
            onCheckedChange={(checked) => handleChange("debug", checked)}
            className="data-[state=checked]:bg-accent"
          />
        </div>
      </div>

      <div className="input-group">
        <Label htmlFor="mode" className="text-base font-medium">Environment Mode</Label>
        <p className="text-sm text-slate-500 mt-1">Select the environment mode for deployment</p>
        <Select
          value={data.mode}
          onValueChange={(value) => handleChange("mode", value)}
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

      <div className="border-t pt-4 mt-6">
        <h3 className="font-medium text-lg mb-4">Git Configuration</h3>
        
        <div className="input-group mb-4">
          <Label htmlFor="gitRepoUrl" className="text-base font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" /> Git Repository URL
          </Label>
          <p className="text-sm text-slate-500 mt-1">URL of the Git repository to clone</p>
          <Input
            id="gitRepoUrl"
            value={data.gitRepoUrl || ""}
            onChange={(e) => handleChange("gitRepoUrl", e.target.value)}
            className="mt-2"
            placeholder="github.com/username/repository.git"
          />
        </div>

        <div className="input-group mb-4">
          <Label htmlFor="gitUser" className="text-base font-medium flex items-center gap-2">
            <User className="h-4 w-4" /> Git Username
          </Label>
          <p className="text-sm text-slate-500 mt-1">Username for Git authentication</p>
          <Input
            id="gitUser"
            value={data.gitUser || ""}
            onChange={(e) => handleChange("gitUser", e.target.value)}
            className="mt-2"
            placeholder="username"
          />
        </div>

        <div className="input-group mb-4">
          <Label htmlFor="gitToken" className="text-base font-medium flex items-center gap-2">
            <Lock className="h-4 w-4" /> Git Token
          </Label>
          <p className="text-sm text-slate-500 mt-1">Authentication token for Git</p>
          <Input
            id="gitToken"
            type="password"
            value={data.gitToken || ""}
            onChange={(e) => handleChange("gitToken", e.target.value)}
            className="mt-2"
            placeholder="Personal Access Token"
          />
        </div>

        <div className="input-group">
          <Label htmlFor="installDirectory" className="text-base font-medium flex items-center gap-2">
            <Folder className="h-4 w-4" /> Installation Directory
          </Label>
          <p className="text-sm text-slate-500 mt-1">Directory where the project will be installed</p>
          <Input
            id="installDirectory"
            value={data.installDirectory || ""}
            onChange={(e) => handleChange("installDirectory", e.target.value)}
            className="mt-2"
            placeholder="/path/to/installation/directory"
          />
        </div>
      </div>
    </div>
  );
};
