
import { NeptunoConfig } from "@/types/config";

export const validateSection = (section: keyof NeptunoConfig, data: any): string[] => {
  const errors: string[] = [];
  
  switch (section) {
    case "project":
      if (!data.name) errors.push("Project name is required");
      if (!data.domain) errors.push("Domain is required");
      break;
      
    case "server":
      if (!data.host) errors.push("Host is required");
      if (!data.port) errors.push("Port is required");
      if (!data.dbType) errors.push("Database type is required");
      if (!data.dbHost) errors.push("Database host is required");
      if (!data.dbPort) errors.push("Database port is required");
      break;
      
    case "auth":
      if (!data.googleCustomerId) errors.push("Google Customer ID is required");
      if (!data.googleCustomerSecret) errors.push("Google Customer Secret is required");
      if (!data.metaClientId) errors.push("Meta Client ID is required");
      if (!data.metaClientSecret) errors.push("Meta Client Secret is required");
      break;
      
    case "frontend":
      if (!data.url) errors.push("Frontend URL is required");
      if (!data.host) errors.push("Frontend host is required");
      if (!data.secretKey) errors.push("Secret key is required");
      if (!data.desktop) errors.push("Desktop framework is required");
      break;
  }
  
  return errors;
};
