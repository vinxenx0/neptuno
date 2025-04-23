
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { executeInstallation } from "@/utils/install";
import { NeptunoConfig } from "@/types/config";
import InstallConfirmDialog from "./InstallConfirmDialog";

interface InstallProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: NeptunoConfig;
  onInstallComplete: (success: boolean, applicationUrl?: string) => void;
}

export const InstallProgressDialog = ({ 
  open, 
  onOpenChange,
  config,
  onInstallComplete 
}: InstallProgressDialogProps) => {
  const [installProgress, setInstallProgress] = useState(0);
  const [installStatus, setInstallStatus] = useState("");
  const [installLog, setInstallLog] = useState("");
  const [installComplete, setInstallComplete] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    if (open && !installComplete) {
      startInstallation();
    }
  }, [open]);

  const startInstallation = async () => {
    try {
      await executeInstallation(
        config,
        setInstallStatus,
        setInstallProgress,
        setInstallLog,
        handleInstallComplete
      );
    } catch (error) {
      console.error("Installation failed:", error);
    }
  };

  const handleInstallComplete = (success: boolean) => {
    setInstallComplete(true);
    setInstallSuccess(success);
    
    if (success) {
      setShowConfirmDialog(true);
    }
  };

  const handleClose = () => {
    if (installComplete) {
      onOpenChange(false);
    }
  };

  const handleCompleteInstall = (showSuccess: boolean, applicationUrl: string) => {
    // Close the confirm dialog
    setShowConfirmDialog(false);
    // Close the progress dialog
    onOpenChange(false);
    // Signal to the parent component that installation is complete and pass the application URL
    onInstallComplete(showSuccess, applicationUrl);
  };

  return (
    <>
      <Dialog open={open && !showConfirmDialog} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Installing Neptuno</DialogTitle>
            <DialogDescription>
              {installComplete ? 
                (installSuccess ? 
                  "Installation completed successfully!" : 
                  "Installation failed. Please check the logs below.") : 
                "Installing Neptuno, please wait..."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!installComplete && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{installStatus}</span>
                  <span>{Math.round(installProgress)}%</span>
                </div>
                <Progress value={installProgress} className="h-2" />
              </div>
            )}
            
            {installComplete && (
              <div className={`flex items-center gap-2 ${installSuccess ? "text-green-600" : "text-red-600"}`}>
                {installSuccess ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <X className="h-5 w-5" />
                )}
                <span className="font-medium">{installSuccess ? "Installation Complete" : "Installation Failed"}</span>
              </div>
            )}
            
            <div className="pt-2">
              <p className="text-sm font-medium mb-1">Installation Log:</p>
              <Textarea 
                value={installLog} 
                readOnly 
                className="h-40 font-mono text-xs"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handleClose}
              disabled={!installComplete}
            >
              {installComplete ? "Close" : "Cancel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <InstallConfirmDialog
        open={showConfirmDialog}
        onClose={() => {
          setShowConfirmDialog(false);
          onOpenChange(false);
          onInstallComplete(false);
        }}
        config={config}
        installSuccess={installSuccess}
        onCompleteInstall={handleCompleteInstall}
      />
    </>
  );
};

export default InstallProgressDialog;
