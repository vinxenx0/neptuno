
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectForm } from "./ProjectForm";
import { EnvironmentForm } from "./EnvironmentForm";
import { useTranslation } from "@/hooks/useTranslation";

interface ProjectSettingsFormProps {
  data: {
    project: any;
    environment: any;
  };
  onChange: (section: "project" | "environment", data: any) => void;
}

export const ProjectSettingsForm = ({ data, onChange }: ProjectSettingsFormProps) => {
  const { t } = useTranslation();
  
  return (
    <Tabs defaultValue="project" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="project">{t("projectConfiguration")}</TabsTrigger>
        <TabsTrigger value="environment">{t("environmentSettings")}</TabsTrigger>
      </TabsList>
      <TabsContent value="project">
        <ProjectForm data={data.project} onChange={(newData) => onChange("project", newData)} />
      </TabsContent>
      <TabsContent value="environment">
        <EnvironmentForm data={data.environment} onChange={(newData) => onChange("environment", newData)} />
      </TabsContent>
    </Tabs>
  );
};
