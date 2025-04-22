export interface NeptunoConfig {
  project: {
    name: string;
    domain: string;
    proxy: string;
    githubRepo: string;
    githubToken: string;
    adminEmail: string;
    adminPassword: string;
    isDemo: boolean;
    hasTemplates: boolean;
    hasSDK: boolean;
    hasCache: boolean;
    hasGraphQL: boolean;
    hasDocs: boolean;
  };
  environment: {
    debug: boolean;
    mode: 'development' | 'production' | 'staging';
  };
  server: {
    host: string;
    port: string;
    dbType: string;
    dbHost: string;
    dbPort: string;
    dbUser: string;
    dbPassword: string;
    dbName: string;
    nginx: {
      serverName: string;
      enableSSL: boolean;
      sslCertPath: string;
      sslKeyPath: string;
      staticCacheTime: string;
      proxyTimeout: string;
      apiTimeout: string;
      enableCache: boolean;
    };
    loadBalancing: {
      enabled: boolean;
      backendKeepAlive: number;
      backendPort: string;
      frontendPorts: string[];
      balancingMethod: "least_conn" | "round_robin" | "ip_hash";
    };
  };
  auth: {
    googleCustomerId: string;
    googleCustomerSecret: string;
    googleRedirectUri: string;
    metaClientId: string;
    metaClientSecret: string;
    metaRedirectUri: string;
  };
  redis: {
    host: string;
    port: string;
  };
  frontend: {
    url: string;
    host: string;
    publicApiUrl: string;
    secretKey: string;
    desktop: "NEXT" | "VITE" | "REACT";
  };
  docker: {
    backend: {
      workersPerCore: number;
      maxWorkers: number;
      maxThreads?: number;
      maxRequests?: number;
    };
    frontend: {
      cpuLimit: string;
      memoryLimit: number;
      replicas?: number;
    };
    database: {
      type: "mariadb" | "mysql" | "postgres";
      rootPassword: string;
      database?: string;
      user?: string;
      password?: string;
    };
    volumes: {
      enabled: boolean;
      paths?: Record<string, string>;
    };
  };
}

export type ConfigSection = 
  | "project"
  | "server"
  | "auth"
  | "frontend"
  | "docker"
  | "download"
  | "environment"
  | "redis";
