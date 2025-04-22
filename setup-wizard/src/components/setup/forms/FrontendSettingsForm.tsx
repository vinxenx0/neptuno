
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FrontendForm } from "./FrontendForm";
import { RedisForm } from "./RedisForm";
import { useTranslation } from "@/hooks/useTranslation";

interface FrontendSettingsFormProps {
  data: {
    frontend: any;
    redis: any;
  };
  onChange: (section: "frontend" | "redis", data: any) => void;
}

export const FrontendSettingsForm = ({ data, onChange }: FrontendSettingsFormProps) => {
  const { t } = useTranslation();
  
  return (
    <Tabs defaultValue="frontend" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="frontend">{t("frontendSettings")}</TabsTrigger>
        <TabsTrigger value="redis">{t("redisConfiguration")}</TabsTrigger>
      </TabsList>
      <TabsContent value="frontend">
        <FrontendForm data={data.frontend} onChange={(newData) => onChange("frontend", newData)} />
      </TabsContent>
      <TabsContent value="redis">
        <RedisForm data={data.redis} onChange={(newData) => onChange("redis", newData)} />
      </TabsContent>
    </Tabs>
  );
};
