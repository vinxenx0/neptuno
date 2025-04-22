
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateDockerComposeFile } from "@/utils/docker";

interface DockerFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const DockerForm = ({ data, onChange }: DockerFormProps) => {
  const { t } = useTranslation();

  const handleDownloadDockerCompose = () => {
    const content = generateDockerComposeFile(data);
    const blob = new Blob([content], { type: "text/yaml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "docker-compose.yml";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="backend" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="backend">{t("backend")}</TabsTrigger>
          <TabsTrigger value="frontend">{t("frontend")}</TabsTrigger>
          <TabsTrigger value="database">{t("database")}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="backend" className="space-y-4">
          <div className="input-group">
            <Label htmlFor="backend.workersPerCore" className="text-base font-medium">
              {t("workersPerCore")}
            </Label>
            <p className="text-sm text-slate-500 mt-1">{t("workersPerCoreDesc")}</p>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                id="backend.workersPerCore"
                value={[data.backend.workersPerCore * 10]}
                onValueChange={(value) => onChange({
                  ...data,
                  backend: {
                    ...data.backend,
                    workersPerCore: value[0] / 10
                  }
                })}
                max={20}
                step={1}
                className="flex-1"
              />
              <span className="w-12 text-right">{data.backend.workersPerCore}</span>
            </div>
          </div>
          
          <div className="input-group">
            <Label htmlFor="backend.maxWorkers" className="text-base font-medium">
              {t("maxWorkers")}
            </Label>
            <p className="text-sm text-slate-500 mt-1">{t("maxWorkersDesc")}</p>
            <Input
              id="backend.maxWorkers"
              type="number"
              min="1"
              max="32"
              value={data.backend.maxWorkers}
              onChange={(e) => onChange({
                ...data,
                backend: {
                  ...data.backend,
                  maxWorkers: parseInt(e.target.value) || 2
                }
              })}
              className="mt-2"
            />
          </div>
          
          <div className="input-group">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="backend.enableThreadLimits" className="text-base font-medium">
                  {t("enableThreadLimits")}
                </Label>
                <p className="text-sm text-slate-500 mt-1">{t("enableThreadLimitsDesc")}</p>
              </div>
              <Switch
                id="backend.enableThreadLimits"
                checked={!!data.backend.maxThreads}
                onCheckedChange={(checked) => onChange({
                  ...data,
                  backend: {
                    ...data.backend,
                    maxThreads: checked ? 2 : undefined,
                    maxRequests: checked ? 1000 : undefined
                  }
                })}
                className="data-[state=checked]:bg-accent"
              />
            </div>
          </div>
          
          {data.backend.maxThreads && (
            <>
              <div className="input-group">
                <Label htmlFor="backend.maxThreads" className="text-base font-medium">
                  {t("maxThreads")}
                </Label>
                <p className="text-sm text-slate-500 mt-1">{t("maxThreadsDesc")}</p>
                <Input
                  id="backend.maxThreads"
                  type="number"
                  min="1"
                  max="16"
                  value={data.backend.maxThreads}
                  onChange={(e) => onChange({
                    ...data,
                    backend: {
                      ...data.backend,
                      maxThreads: parseInt(e.target.value) || 2
                    }
                  })}
                  className="mt-2"
                />
              </div>
              
              <div className="input-group">
                <Label htmlFor="backend.maxRequests" className="text-base font-medium">
                  {t("maxRequests")}
                </Label>
                <p className="text-sm text-slate-500 mt-1">{t("maxRequestsDesc")}</p>
                <Input
                  id="backend.maxRequests"
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  value={data.backend.maxRequests}
                  onChange={(e) => onChange({
                    ...data,
                    backend: {
                      ...data.backend,
                      maxRequests: parseInt(e.target.value) || 1000
                    }
                  })}
                  className="mt-2"
                />
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="frontend" className="space-y-4">
          <div className="input-group">
            <Label htmlFor="frontend.cpuLimit" className="text-base font-medium">
              {t("cpuLimit")}
            </Label>
            <p className="text-sm text-slate-500 mt-1">{t("cpuLimitDesc")}</p>
            <Input
              id="frontend.cpuLimit"
              value={data.frontend.cpuLimit}
              onChange={(e) => onChange({
                ...data,
                frontend: {
                  ...data.frontend,
                  cpuLimit: e.target.value
                }
              })}
              className="mt-2"
              placeholder="0.5"
            />
          </div>
          
          <div className="input-group">
            <Label htmlFor="frontend.memoryLimit" className="text-base font-medium">
              {t("memoryLimit")}
            </Label>
            <p className="text-sm text-slate-500 mt-1">{t("memoryLimitDesc")}</p>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                id="frontend.memoryLimit"
                value={[data.frontend.memoryLimit / 128]}
                onValueChange={(value) => onChange({
                  ...data,
                  frontend: {
                    ...data.frontend,
                    memoryLimit: value[0] * 128
                  }
                })}
                max={32}
                step={1}
                className="flex-1"
              />
              <span className="w-12 text-right">{data.frontend.memoryLimit}MB</span>
            </div>
          </div>
          
          <div className="input-group">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="frontend.enableReplicas" className="text-base font-medium">
                  {t("enableReplicas")}
                </Label>
                <p className="text-sm text-slate-500 mt-1">{t("enableReplicasDesc")}</p>
              </div>
              <Switch
                id="frontend.enableReplicas"
                checked={!!data.frontend.replicas}
                onCheckedChange={(checked) => onChange({
                  ...data,
                  frontend: {
                    ...data.frontend,
                    replicas: checked ? 2 : undefined
                  }
                })}
                className="data-[state=checked]:bg-accent"
              />
            </div>
          </div>
          
          {data.frontend.replicas && (
            <div className="input-group">
              <Label htmlFor="frontend.replicas" className="text-base font-medium">
                {t("replicas")}
              </Label>
              <p className="text-sm text-slate-500 mt-1">{t("replicasDesc")}</p>
              <Input
                id="frontend.replicas"
                type="number"
                min="1"
                max="10"
                value={data.frontend.replicas}
                onChange={(e) => onChange({
                  ...data,
                  frontend: {
                    ...data.frontend,
                    replicas: parseInt(e.target.value) || 2
                  }
                })}
                className="mt-2"
              />
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="database" className="space-y-4">
          <div className="input-group">
            <Label htmlFor="database.type" className="text-base font-medium">
              {t("databaseType")}
            </Label>
            <p className="text-sm text-slate-500 mt-1">{t("dockerDatabaseTypeDesc")}</p>
            <Select 
              value={data.database.type}
              onValueChange={(value: "mariadb" | "mysql" | "postgres") => onChange({
                ...data,
                database: {
                  ...data.database,
                  type: value
                }
              })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder={t("selectDatabaseType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mariadb">MariaDB</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="postgres">PostgreSQL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="input-group">
            <Label htmlFor="database.rootPassword" className="text-base font-medium">
              {t("rootPassword")}
            </Label>
            <p className="text-sm text-slate-500 mt-1">{t("rootPasswordDesc")}</p>
            <Input
              id="database.rootPassword"
              type="password"
              value={data.database.rootPassword}
              onChange={(e) => onChange({
                ...data,
                database: {
                  ...data.database,
                  rootPassword: e.target.value
                }
              })}
              className="mt-2"
              placeholder={t("enterRootPassword")}
            />
          </div>
          
          <div className="input-group">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="database.enableUserDb" className="text-base font-medium">
                  {t("enableUserDb")}
                </Label>
                <p className="text-sm text-slate-500 mt-1">{t("enableUserDbDesc")}</p>
              </div>
              <Switch
                id="database.enableUserDb"
                checked={!!data.database.database}
                onCheckedChange={(checked) => onChange({
                  ...data,
                  database: {
                    ...data.database,
                    database: checked ? "" : undefined,
                    user: checked ? "" : undefined,
                    password: checked ? "" : undefined
                  }
                })}
                className="data-[state=checked]:bg-accent"
              />
            </div>
          </div>
          
          {data.database.database !== undefined && (
            <>
              <div className="input-group">
                <Label htmlFor="database.database" className="text-base font-medium">
                  {t("databaseName")}
                </Label>
                <p className="text-sm text-slate-500 mt-1">{t("databaseNameDesc")}</p>
                <Input
                  id="database.database"
                  value={data.database.database}
                  onChange={(e) => onChange({
                    ...data,
                    database: {
                      ...data.database,
                      database: e.target.value
                    }
                  })}
                  className="mt-2"
                  placeholder={t("enterDatabaseName")}
                />
              </div>
              
              <div className="input-group">
                <Label htmlFor="database.user" className="text-base font-medium">
                  {t("databaseUser")}
                </Label>
                <p className="text-sm text-slate-500 mt-1">{t("databaseUsername")}</p>
                <Input
                  id="database.user"
                  value={data.database.user}
                  onChange={(e) => onChange({
                    ...data,
                    database: {
                      ...data.database,
                      user: e.target.value
                    }
                  })}
                  className="mt-2"
                  placeholder={t("enterUsername")}
                />
              </div>
              
              <div className="input-group">
                <Label htmlFor="database.password" className="text-base font-medium">
                  {t("databasePassword")}
                </Label>
                <p className="text-sm text-slate-500 mt-1">{t("databasePasswordDesc")}</p>
                <Input
                  id="database.password"
                  type="password"
                  value={data.database.password}
                  onChange={(e) => onChange({
                    ...data,
                    database: {
                      ...data.database,
                      password: e.target.value
                    }
                  })}
                  className="mt-2"
                  placeholder={t("enterPassword")}
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="pt-4 border-t">
        <Button 
          onClick={handleDownloadDockerCompose}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          {t("downloadDockerCompose")}
        </Button>
      </div>
    </div>
  );
};
