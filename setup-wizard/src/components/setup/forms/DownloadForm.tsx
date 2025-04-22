
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { NeptunoConfig } from "@/types/config";
import { generateEnvFile, downloadEnvFile } from "@/utils/config";
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

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          <ul className="space-y-3 mb-6">
            <li className="flex items-center text-sm text-slate-600">
              <span className="w-4 h-4 mr-2 rounded-full bg-blue-100 flex items-center justify-center">•</span>
              .env - Environment variables
            </li>
            <li className="flex items-center text-sm text-slate-600">
              <span className="w-4 h-4 mr-2 rounded-full bg-blue-100 flex items-center justify-center">•</span>
              README.md - Project documentation
            </li>
            <li className="flex items-center text-sm text-slate-600">
              <span className="w-4 h-4 mr-2 rounded-full bg-blue-100 flex items-center justify-center">•</span>
              docker-compose.yml - Docker configuration
            </li>
            <li className="flex items-center text-sm text-slate-600">
              <span className="w-4 h-4 mr-2 rounded-full bg-blue-100 flex items-center justify-center">•</span>
              nginx.conf - Nginx configuration
            </li>
          </ul>
          
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
          
          <Button onClick={downloadAllConfigs} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download All as ZIP
          </Button>
        </Card>
      </div>
    </div>
  );
};

// Helper functions to generate config files
function generateReadme(config: NeptunoConfig): string {
  return `# ${config.project.name}

## Project Configuration
- Domain: ${config.project.domain}
- Environment: ${config.environment.mode}
- Debug Mode: ${config.environment.debug}

## Features
- Demo Site: ${config.project.isDemo}
- Templates: ${config.project.hasTemplates}
- SDK: ${config.project.hasSDK}
- Cache: ${config.project.hasCache}
- GraphQL: ${config.project.hasGraphQL}
- Documentation: ${config.project.hasDocs}

## Server Configuration
- Host: ${config.server.host}
- Port: ${config.server.port}
- Database: ${config.server.dbType}

## Load Balancing
${config.server.loadBalancing.enabled ? `
- Backend Keep-Alive: ${config.server.loadBalancing.backendKeepAlive}
- Balancing Method: ${config.server.loadBalancing.balancingMethod}
- Frontend Ports: ${config.server.loadBalancing.frontendPorts.join(", ")}
` : '- Load balancing is disabled'}

## Getting Started
1. Install dependencies
2. Configure your environment using the provided .env file
3. Start the application using Docker Compose
`;
}

function generateDockerCompose(config: NeptunoConfig): string {
  return `version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=${config.environment.mode}
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
    ports:
      - "${config.server.port}:${config.server.port}"
    environment:
      - NODE_ENV=${config.environment.mode}
    depends_on:
      - db
      - redis

  db:
    image: ${config.server.dbType}
    environment:
      - POSTGRES_DB=${config.server.dbName}
      - POSTGRES_USER=${config.server.dbUser}
      - POSTGRES_PASSWORD=${config.server.dbPassword}

  redis:
    image: redis:alpine
    ports:
      - "${config.redis.port}:6379"
`;
}

function generateNginxConfig(config: NeptunoConfig): string {
  return `# Nginx configuration
server {
    listen 80;
    server_name ${config.project.domain};

    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://backend:${config.server.port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

${config.server.loadBalancing.enabled ? `
upstream frontend {
    ${config.server.loadBalancing.balancingMethod === 'least_conn' ? 'least_conn;' : 
      config.server.loadBalancing.balancingMethod === 'ip_hash' ? 'ip_hash;' : ''}
    ${config.server.loadBalancing.frontendPorts.map(port => 
      `    server 127.0.0.1:${port};`).join('\n')}
}` : ''}
`;
}

export default DownloadForm;
