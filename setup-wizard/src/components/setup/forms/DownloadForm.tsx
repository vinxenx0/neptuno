import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { NeptunoConfig } from "@/types/config";
import { generateEnvFile, downloadEnvFile } from "@/utils/config";
import ConfigFileList from "../download/ConfigFileList";
import DownloadButtons from "../download/DownloadButtons";
import { downloadFile } from "@/utils/download";
import { 
  generateDockerCompose, 
  generateNginxConfig, 
  generateReadme 
} from "@/utils/configGenerators";
import JSZip from "jszip";

interface DownloadFormProps {
  config: NeptunoConfig;
}

export const DownloadForm = ({ config }: DownloadFormProps) => {
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

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Available Configuration Files</h3>
          
          <ConfigFileList />
          
          <DownloadButtons 
            onDownloadEnv={handleDownloadEnv}
            onDownloadReadme={handleDownloadReadme}
            onDownloadDockerCompose={handleDownloadDockerCompose}
            onDownloadNginx={handleDownloadNginx}
          />
          
          <Button onClick={downloadAllConfigs} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download All as ZIP
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default DownloadForm;
