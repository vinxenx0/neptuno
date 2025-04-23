
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { NeptunoConfig } from "@/types/config";
import { generateEnvFile, downloadEnvFile } from "@/utils/config";
import JSZip from "jszip";
import InstallProgressDialog from "@/components/setup/InstallProgressDialog";
import { toast } from "sonner";
import ConfigFileList from "../download/ConfigFileList";
import { downloadFile } from "@/utils/download";
import { 
  generateDockerCompose, 
  generateNginxConfig, 
  generateReadme 
} from "@/utils/configGenerators";

interface InstallFormProps {
  config: NeptunoConfig;
}

export const InstallForm = ({ config }: InstallFormProps) => {
  const [showInstallProgress, setShowInstallProgress] = useState(false);
  
  const handleDownloadEnv = () => {
    const envContent = generateEnvFile(config);
    downloadEnvFile(envContent);
  };

  const handleDownloadReadme = () => {
    const content = generateReadme(config);
    downloadFile(content, "README.md", "text/markdown");
  };

  const handleDownloadDockerCompose = () => {
    const content = generateDockerCompose(config);
    downloadFile(content, "docker-compose.yml", "text/yaml");
  };

  const handleDownloadNginx = () => {
    const content = generateNginxConfig(config);
    downloadFile(content, "nginx.conf", "text/plain");
  };

  const downloadAllConfigs = async () => {
    const zip = new JSZip();
    
    // Add files to the zip
    zip.file(".env", generateEnvFile(config));
    zip.file("README.md", generateReadme(config));
    zip.file("docker-compose.yml", generateDockerCompose(config));
    zip.file("nginx.conf", generateNginxConfig(config));

    // Generate and download the zip
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = "neptuno-config.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const installProject = () => {
    // Validate required fields
    if (!config.environment.gitRepoUrl) {
      toast.error("Git Repository URL is required");
      return;
    }
    if (!config.environment.installDirectory) {
      toast.error("Installation Directory is required");
      return;
    }

    setShowInstallProgress(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Configuration Files</h3>
          <ConfigFileList />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <Button onClick={handleDownloadEnv} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download .env
            </Button>
            <Button onClick={handleDownloadReadme} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download README.md
            </Button>
            <Button onClick={handleDownloadDockerCompose} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download docker-compose.yml
            </Button>
            <Button onClick={handleDownloadNginx} variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Download nginx.conf
            </Button>
          </div>
          
          <Button onClick={downloadAllConfigs} className="w-full mb-6">
            <Download className="w-4 h-4 mr-2" />
            Download All as ZIP
          </Button>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Install Project</h3>
            <p className="text-sm text-slate-600 mb-4">
              Click the button below to install the project. This will clone the repository and configure all the necessary files.
            </p>
            {/* Re-add the install button */}
            <Button onClick={installProject} className="w-full">
              Install
            </Button>
          </div>
        </Card>
      </div>

      {/* Use the InstallProgressDialog */}
      <InstallProgressDialog 
        open={showInstallProgress} 
        onOpenChange={setShowInstallProgress} 
        config={config} 
      />
    </div>
  );
};

export default InstallForm;
