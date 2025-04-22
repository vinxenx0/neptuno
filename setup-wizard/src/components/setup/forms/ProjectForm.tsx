
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Globe, Github, User, Lock } from "lucide-react";

interface ProjectFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const ProjectForm = ({ data, onChange }: ProjectFormProps) => {
  const handleChange = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const FeatureToggle = ({ id, label, description }: { id: string; label: string; description: string }) => (
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor={id} className="text-base font-medium">{label}</Label>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      <Switch
        id={id}
        checked={data[id]}
        onCheckedChange={(checked) => handleChange(id, checked)}
        className="data-[state=checked]:bg-accent"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="input-group">
          <Label htmlFor="name" className="text-base font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" /> Project Name
          </Label>
          <p className="text-sm text-slate-500 mt-1">The name of your project</p>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="mt-2"
            placeholder="My Awesome Project"
          />
        </div>

        <div className="input-group">
          <Label htmlFor="domain" className="text-base font-medium">Domain</Label>
          <p className="text-sm text-slate-500 mt-1">The domain where your project will be hosted</p>
          <Input
            id="domain"
            value={data.domain}
            onChange={(e) => handleChange("domain", e.target.value)}
            className="mt-2"
            placeholder="myproject.com"
          />
        </div>

        <div className="input-group">
          <Label htmlFor="adminEmail" className="text-base font-medium flex items-center gap-2">
            <User className="h-4 w-4" /> Admin Email
          </Label>
          <p className="text-sm text-slate-500 mt-1">Super administrator email address</p>
          <Input
            id="adminEmail"
            type="email"
            value={data.adminEmail}
            onChange={(e) => handleChange("adminEmail", e.target.value)}
            className="mt-2"
            placeholder="admin@example.com"
          />
        </div>

        <div className="input-group">
          <Label htmlFor="adminPassword" className="text-base font-medium flex items-center gap-2">
            <Lock className="h-4 w-4" /> Admin Password
          </Label>
          <p className="text-sm text-slate-500 mt-1">Super administrator password</p>
          <Input
            id="adminPassword"
            type="password"
            value={data.adminPassword}
            onChange={(e) => handleChange("adminPassword", e.target.value)}
            className="mt-2"
            placeholder="Secure password"
          />
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="font-medium text-lg mb-4">Features Configuration</h3>
        
        <FeatureToggle
          id="isDemo"
          label="Demo Site"
          description="Enable demo site functionality"
        />
        
        <FeatureToggle
          id="hasTemplates"
          label="Default Templates"
          description="Include default templates"
        />
        
        <FeatureToggle
          id="hasSDK"
          label="SDK Support"
          description="Enable SDK integration"
        />
        
        <FeatureToggle
          id="hasCache"
          label="Cache System"
          description="Enable caching functionality"
        />
        
        <FeatureToggle
          id="hasGraphQL"
          label="GraphQL Support"
          description="Enable GraphQL API"
        />
        
        <FeatureToggle
          id="hasDocs"
          label="Documentation"
          description="Include project documentation"
        />
      </div>
    </div>
  );
};
