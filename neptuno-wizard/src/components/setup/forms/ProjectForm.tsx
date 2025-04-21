
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Globe, Github } from "lucide-react";

interface ProjectFormProps {
  data: any;
  onChange: (data: any) => void;
}

export const ProjectForm = ({ data, onChange }: ProjectFormProps) => {
  const handleChange = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  return (
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
        <Label htmlFor="githubRepo" className="text-base font-medium flex items-center gap-2">
          <Github className="h-4 w-4" /> GitHub Repository
        </Label>
        <p className="text-sm text-slate-500 mt-1">Your GitHub repository URL</p>
        <Input
          id="githubRepo"
          value={data.githubRepo}
          onChange={(e) => handleChange("githubRepo", e.target.value)}
          className="mt-2"
          placeholder="username/repository"
        />
      </div>

      <div className="input-group">
        <Label htmlFor="githubToken" className="text-base font-medium">GitHub Access Token</Label>
        <p className="text-sm text-slate-500 mt-1">Personal access token with repo permissions</p>
        <Input
          id="githubToken"
          type="password"
          value={data.githubToken}
          onChange={(e) => handleChange("githubToken", e.target.value)}
          className="mt-2"
          placeholder="ghp_xxxxxxxxxxxx"
        />
      </div>
    </div>
  );
};
