
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Settings, Server, Key, Box, Download } from "lucide-react";
import { NeptunoConfig, ConfigSection } from "@/types/config";
import { ProjectSettingsForm } from "./forms/ProjectSettingsForm";
import { ServerForm } from "./forms/ServerForm";
import { AuthForm } from "./forms/AuthForm";
import { FrontendSettingsForm } from "./forms/FrontendSettingsForm";
import { DockerForm } from "./forms/DockerForm";
import { InstallForm } from "./forms/InstallForm";
import { useTranslation } from "@/hooks/useTranslation";

interface ConfigFormProps {
  section: ConfigSection;
  config: NeptunoConfig;
  onUpdate: (section: ConfigSection, data: any) => void;
  onNext: () => void;
  onBack?: () => void;
}

const sectionIcons: Record<ConfigSection, React.ReactNode> = {
  project: <Globe className="h-5 w-5 text-blue-500" />,
  server: <Server className="h-5 w-5 text-amber-500" />,
  auth: <Key className="h-5 w-5 text-purple-500" />,
  frontend: <Settings className="h-5 w-5 text-cyan-500" />,
  docker: <Box className="h-5 w-5 text-orange-500" />,
  install: <Download className="h-5 w-5 text-gray-500" />,
  environment: <Settings className="h-5 w-5 text-teal-500" />,
  redis: <Server className="h-5 w-5 text-red-500" />
};

const ConfigForm = ({ section, config, onUpdate, onNext, onBack }: ConfigFormProps) => {
  const { t } = useTranslation();

  const renderFormContent = () => {
    switch (section) {
      case "project":
        return (
          <ProjectSettingsForm
            data={{ project: config.project, environment: config.environment }}
            onChange={(section: "project" | "environment", data) => onUpdate(section, data)}
          />
        );
      case "server":
        return <ServerForm data={config[section]} onChange={(data) => onUpdate(section, data)} />;
      case "auth":
        return <AuthForm data={config[section]} onChange={(data) => onUpdate(section, data)} />;
      case "frontend":
        return (
          <FrontendSettingsForm
            data={{ frontend: config.frontend, redis: config.redis }}
            onChange={(section: "frontend" | "redis", data) => onUpdate(section, data)}
          />
        );
      case "docker":
        return <DockerForm data={config[section]} onChange={(data) => onUpdate(section, data)} />;
      case "install":
        return <InstallForm config={config} />;
      default:
        return null;
    }
  };

  const sectionTitles: Record<ConfigSection, string> = {
    project: t("projectConfiguration"),
    server: t("serverConfiguration"),
    auth: t("authenticationSettings"),
    frontend: t("frontendSettings"),
    docker: t("dockerConfiguration"),
    install: t("installConfiguration"),
    environment: t("environmentSettings"),
    redis: t("redisConfiguration")
  };

  const sectionDescriptions: Record<ConfigSection, string> = {
    project: t("projectDescription"),
    server: t("serverDescription"),
    auth: t("authDescription"),
    frontend: t("frontendDescription"),
    docker: t("dockerDescription"),
    install: t("installDescription"),
    environment: t("environmentDescription"),
    redis: t("redisDescription")
  };

  const isLastStep = section === "docker";
  const isInstallStep = section === "install";

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-md border-slate-200">
      <CardHeader className="space-y-1 border-b pb-4">
        <div className="flex items-center space-x-3">
          {sectionIcons[section]}
          <CardTitle className="text-xl text-slate-800">{sectionTitles[section]}</CardTitle>
        </div>
        <CardDescription className="text-slate-500">
          {sectionDescriptions[section]}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {renderFormContent()}
          
          <div className="flex justify-between pt-6 border-t mt-6">
            {onBack && (
              <Button 
                variant="outline" 
                onClick={onBack}
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                {t("back")}
              </Button>
            )}
            <Button 
              onClick={onNext} 
              className="ml-auto gradient-btn text-white"
            >
              {isInstallStep ? t("install") : isLastStep ? t("finishAndInstall") : t("nextStep")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConfigForm;
