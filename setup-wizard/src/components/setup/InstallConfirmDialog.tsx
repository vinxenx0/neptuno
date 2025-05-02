
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { NeptunoConfig } from "@/types/config";
import { useState } from "react";
import { runDockerContainers } from "@/utils/install";

interface InstallConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  config: NeptunoConfig;
  installSuccess: boolean;
  onCompleteInstall: (showSuccess: boolean, applicationUrl: string) => void;
}

export const InstallConfirmDialog = ({ 
  open, 
  onClose, 
  config,
  installSuccess,
  onCompleteInstall
}: InstallConfirmDialogProps) => {
  const [isRunningDocker, setIsRunningDocker] = useState(false);
  const [dockerLog, setDockerLog] = useState("");
  
  // Generate application URL from config
  const applicationUrl = config.project?.domain ? 
    `https://${config.project.domain}` : 
    `http://localhost:${config.frontend?.port || 3000}`;

  const handleRunDocker = async () => {
    setIsRunningDocker(true);
    try {
      await runDockerContainers(config.environment.installDirectory, setDockerLog);
      // Success
    } catch (error) {
      setDockerLog(prev => prev + `\nERROR: ${error}\n`);
    }
  };

  const handleComplete = () => {
    onCompleteInstall(true, applicationUrl);
    onClose();
  };

  const handleFinish = () => {
    onClose();
  };

  if (!installSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Installation Failed</DialogTitle>
            <DialogDescription>
              The installation process encountered an error. Please check the logs for details.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-green-600">Installation Complete!</DialogTitle>
          <DialogDescription>
            The Neptuno project has been successfully installed. Would you like to start the Docker containers?
          </DialogDescription>
        </DialogHeader>

        {isRunningDocker && dockerLog && (
          <div className="my-4 p-2 bg-gray-100 rounded border text-xs font-mono h-32 overflow-auto">
            {dockerLog}
          </div>
        )}

        {isRunningDocker && (
          <div className="my-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-green-700 font-medium mb-2">Thank you for installing Neptuno!</h3>
            <p className="text-sm text-slate-700 mb-2">
              Your application is now available at:
            </p>
            <div className="bg-white p-2 border rounded font-mono text-blue-600">
              {applicationUrl}
            </div>
          </div>
        )}

        <DialogFooter className="flex space-x-2 justify-end">
          {!isRunningDocker ? (
            <>
              <Button variant="outline" onClick={handleFinish}>
                Finish
              </Button>
              <Button onClick={handleRunDocker}>
                Start Docker Containers
              </Button>
            </>
          ) : (
            <Button onClick={handleComplete}>
              Complete Installation
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InstallConfirmDialog;
