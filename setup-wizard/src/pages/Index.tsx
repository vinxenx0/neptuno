import { useState } from "react";
import ConfigForm from "@/components/setup/ConfigForm";
import StepIndicator from "@/components/setup/StepIndicator";
import { NeptunoConfig, ConfigSection } from "@/types/config";
import { downloadEnvFile, generateEnvFile } from "@/utils/config";
import { toast } from "sonner";

const initialConfig: NeptunoConfig = {
  project: {
    name: "",
    domain: "",
    proxy: "",
    githubRepo: "",
    githubToken: "",
  },
  environment: {
    debug: true,
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
};

const sections: ConfigSection[] = [
  "project",
  "environment",
  "server",
  "auth",
  "redis",
  "frontend",
];

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<NeptunoConfig>(initialConfig);

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
    } else {
      const envContent = generateEnvFile(config);
      downloadEnvFile(envContent);
      toast.success("Configuration complete! Your .env file has been downloaded.");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
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
      </div>
    </div>
  );
};

export default Index;
