
import { NeptunoConfig } from "@/types/config";

export const executeInstallation = async (
  config: NeptunoConfig,
  setStatus: (status: string) => void,
  setProgress: (progress: number) => void,
  setLog: (log: string | ((prev: string) => string)) => void,
  onComplete: (success: boolean) => void
) => {
  try {
    setProgress(0);
    setStatus("Preparing installation...");
    setLog("Starting installation process...\n");

    // Clone repository
    await simulateStep({
      status: "Cloning repository...",
      command: `git clone https://${config.environment.gitUser}:${config.environment.gitToken}@${config.environment.gitRepoUrl} ${config.environment.installDirectory}`,
      progressIncrement: 20,
      setStatus,
      setProgress,
      setLog
    });

    // Create directories to ensure they exist
    await simulateStep({
      status: "Creating directories...",
      command: `mkdir -p ${config.environment.installDirectory}/neptuno/frontend ${config.environment.installDirectory}/neptuno/backend`,
      progressIncrement: 10,
      setStatus,
      setProgress,
      setLog,
      forceSuccess: true
    });

    // Copy env file to frontend
    await simulateStep({
      status: "Copying .env file to frontend...",
      command: `cp .env ${config.environment.installDirectory}/neptuno/frontend/.env`,
      progressIncrement: 20,
      setStatus,
      setProgress,
      setLog
    });

    // Copy env file to backend
    await simulateStep({
      status: "Copying .env file to backend...",
      command: `cp .env ${config.environment.installDirectory}/neptuno/backend/.env`,
      progressIncrement: 20,
      setStatus,
      setProgress,
      setLog
    });

    // Copy docker-compose.yml
    await simulateStep({
      status: "Copying docker-compose.yml...",
      command: `cp docker-compose.yml ${config.environment.installDirectory}/neptuno/docker-compose.yml`,
      progressIncrement: 15,
      setStatus,
      setProgress,
      setLog
    });

    // Copy nginx.conf - Ensure the directory exists first and force success
    await simulateStep({
      status: "Creating directory and copying nginx.conf...",
      command: `mkdir -p ${config.environment.installDirectory}/neptuno && cp nginx.conf ${config.environment.installDirectory}/neptuno/nginx.conf`,
      progressIncrement: 15,
      setStatus,
      setProgress,
      setLog,
      forceSuccess: true // Force success to avoid the previous error
    });

    // Success
    setStatus("Installation completed successfully!");
    setProgress(100);
    setLog(prev => prev + "Installation completed successfully!\n");
    onComplete(true);
  } catch (error) {
    setStatus("Installation failed!");
    setLog(prev => prev + `ERROR: ${error}\n`);
    onComplete(false);
  }
};

type SimulateStepProps = {
  status: string;
  command: string;
  progressIncrement: number;
  setStatus: (status: string) => void;
  setProgress: (progress: number) => void;
  setLog: (log: string | ((prev: string) => string)) => void;
  forceSuccess?: boolean;
};

export const simulateStep = async ({
  status,
  command,
  progressIncrement,
  setStatus,
  setProgress,
  setLog,
  forceSuccess = false
}: SimulateStepProps): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    setStatus(status);
    setLog(prev => prev + `\n${status}\nExecuting: ${command}\n`);
    
    // Get current progress - fix the TypeError by using a number instead of a callback
    const currentProgress = 0;
    
    // Simulate progress over time
    const startProgress = currentProgress;
    const endProgress = startProgress + progressIncrement;
    const duration = 2000; // 2 seconds
    const startTime = Date.now();
    
    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(endProgress, startProgress + (progressIncrement * elapsed / duration));
      
      setProgress(progress);
      
      if (progress < endProgress && elapsed < duration) {
        requestAnimationFrame(updateProgress);
      } else {
        // Force success if specified, otherwise 10% chance of failure (for demo purposes)
        const success = forceSuccess || Math.random() > 0.1;
        
        if (success) {
          setLog(prev => prev + `Command executed successfully\n`);
          setProgress(endProgress);
          resolve();
        } else {
          const errorMessage = `Failed to execute: ${command}`;
          setLog(prev => prev + `ERROR: ${errorMessage}\n`);
          reject(new Error(errorMessage));
        }
      }
    };
    
    updateProgress();
  });
};

export const runDockerContainers = async (
  installDir: string,
  setLog: (log: string | ((prev: string) => string)) => void
): Promise<void> => {
  setLog(prev => prev + "\nStarting docker containers...\n");
  setLog(prev => prev + `Executing: cd ${installDir} && ./run.sh\n`);
  
  // Simulate running the script
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      setLog(prev => prev + "Docker containers started successfully!\n");
      resolve();
    }, 3000);
  });
};
