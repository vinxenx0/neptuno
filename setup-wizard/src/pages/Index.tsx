
import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import ConfigForm from "@/components/setup/ConfigForm";
import StepIndicator from "@/components/setup/StepIndicator";
import { NeptunoConfig, ConfigSection } from "@/types/config";
import { downloadEnvFile, generateEnvFile } from "@/utils/config";
import { toast } from "sonner";
import { TranslationProvider } from "@/hooks/useTranslation";
import { HelpBubble } from "@/components/ui/help-bubble";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import InstallProgressDialog from "@/components/setup/InstallProgressDialog";

const sections: ConfigSection[] = [
  "project",
  "server",
  "auth",
  "frontend",
  "docker",
  "install"
];

const initialConfig: NeptunoConfig = {
  project: {
    name: "",
    domain: "",
    proxy: "",
    githubRepo: "",
    githubToken: "",
    adminEmail: "",
    adminPassword: "",
    isDemo: false,
    hasTemplates: false,
    hasSDK: false,
    hasCache: false,
    hasGraphQL: false,
    hasDocs: false
  },
  environment: {
    debug: true,
    mode: "development",
    gitRepoUrl: "",
    gitUser: "",
    gitToken: "",
    installDirectory: ""
  },
  server: {
    host: "localhost",
    port: "8000",
    dbType: "postgres",
    dbHost: "localhost",
    dbPort: "5432",
    dbUser: "user",
    dbPassword: "",
    dbName: "",
    loadBalancing: {
      enabled: false,
      backendKeepAlive: 32,
      backendPort: "8000",
      frontendPorts: ["3000", "3001"],
      balancingMethod: "least_conn",
    },
    nginx: {
      serverName: "",
      enableSSL: false,
      sslCertPath: "/etc/letsencrypt/live/domain/fullchain.pem",
      sslKeyPath: "/etc/letsencrypt/live/domain/privkey.pem",
      staticCacheTime: "30",
      proxyTimeout: "30",
      apiTimeout: "300",
      enableCache: true,
    },
  },
  auth: {
    googleCustomerId: "your_customer_id",
    googleCustomerSecret: "your_customer_secret",
    googleRedirectUri: "http://localhost:8000/v1/auth/login/google/callback",
    metaClientId: "",
    metaClientSecret: "",
    metaRedirectUri: "http://localhost:8000/v1/auth/login/meta/callback",
  },
  redis: {
    host: "localhost",
    port: "6379",
  },
  frontend: {
    url: "",
    host: "localhost",
    publicApiUrl: "http://127.0.0.1:8000/",
    secretKey: "your_secret_key",
    desktop: "REACT",
  },
  docker: {
    backend: {
      workersPerCore: 0.5,
      maxWorkers: 2,
    },
    frontend: {
      cpuLimit: "0.5",
      memoryLimit: 512,
    },
    database: {
      type: "mariadb",
      rootPassword: "",
    },
    volumes: {
      enabled: true,
    },
  },
};

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<NeptunoConfig>(initialConfig);
  const [showInstallProgress, setShowInstallProgress] = useState(false);
  const [installationComplete, setInstallationComplete] = useState(false);
  const [applicationUrl, setApplicationUrl] = useState("");

  const handleLanguageChange = (lang: string) => {
    console.log("Language changed to:", lang);
  };

  const handleUpdate = (section: ConfigSection, data: any) => {
    setConfig((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const handleNext = () => {
    if (currentStep < sections.length - 1) {
      setCurrentStep((prev) => prev + 1);
      toast.success("Configuration saved!");
    } else if (currentStep === sections.length - 1) {
      setShowInstallProgress(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleInstallComplete = (success: boolean, appUrl?: string) => {
    if (success && appUrl) {
      setInstallationComplete(true);
      setApplicationUrl(appUrl);
    }
    setShowInstallProgress(false);
  };

  const handleVisitApplication = () => {
    window.open(applicationUrl, "_blank");
  };

  const helpResources = [
    {
      title: "Documentation",
      url: "https://docs.example.com/neptuno",
    },
    {
      title: "API Reference",
      url: "https://api.example.com/neptuno",
    },
    {
      title: "Troubleshooting Guide",
      url: "https://support.example.com/neptuno/troubleshooting",
    },
    {
      title: "Video Tutorials",
      url: "https://tutorials.example.com/neptuno",
    },
  ];

  return (
    <TranslationProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
        <Header onLanguageChange={handleLanguageChange} />
        <main className="flex-1 container mx-auto p-8">
          {installationComplete ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Card className="w-full max-w-md bg-white shadow-md border-slate-200">
                <CardHeader className="bg-green-50 border-b border-green-100">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <CardTitle className="text-2xl text-green-700">Installation Complete!</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-slate-800 mb-4">Thank you for installing Neptuno!</h2>
                    <p className="mb-6 text-slate-600">
                      Your application is now ready to use. You can access it at the URL below:
                    </p>
                    <div className="bg-slate-50 p-4 border rounded-md font-mono text-blue-600 mb-6">
                      {applicationUrl}
                    </div>
                    <Button 
                      onClick={handleVisitApplication}
                      className="gradient-btn text-white"
                    >
                      Visit Application
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 gradient-text">Neptuno Setup Wizard</h1>
                <p className="text-slate-600">
                  Configure your application settings step by step
                </p>
              </div>

              <StepIndicator
                currentStep={currentStep + 1}
                totalSteps={sections.length}
              />

              <ConfigForm
                section={sections[currentStep]}
                config={config}
                onUpdate={handleUpdate}
                onNext={handleNext}
                onBack={currentStep > 0 ? handleBack : undefined}
              />
            </>
          )}
        </main>
        <Footer />
        <div className="fixed bottom-4 left-4">
          <HelpBubble resources={helpResources} />
        </div>

        <InstallProgressDialog
          open={showInstallProgress}
          onOpenChange={setShowInstallProgress}
          config={config}
          onInstallComplete={handleInstallComplete}
        />
      </div>
    </TranslationProvider>
  );
};

export default Index;
