
import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadButtonsProps {
  onDownloadEnv: () => void;
  onDownloadReadme: () => void;
  onDownloadDockerCompose: () => void;
  onDownloadNginx: () => void;
}

const DownloadButtons = ({
  onDownloadEnv,
  onDownloadReadme,
  onDownloadDockerCompose,
  onDownloadNginx
}: DownloadButtonsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
      <Button onClick={onDownloadEnv} variant="outline" className="w-full">
        <Download className="w-4 h-4 mr-2" />
        Download .env
      </Button>
      <Button onClick={onDownloadReadme} variant="outline" className="w-full">
        <Download className="w-4 h-4 mr-2" />
        Download README.md
      </Button>
      <Button onClick={onDownloadDockerCompose} variant="outline" className="w-full">
        <Download className="w-4 h-4 mr-2" />
        Download docker-compose.yml
      </Button>
      <Button onClick={onDownloadNginx} variant="outline" className="w-full">
        <Download className="w-4 h-4 mr-2" />
        Download nginx.conf
      </Button>
    </div>
  );
};

export default DownloadButtons;
