import { NeptunoConfig } from "@/types/config";

export const generateEnvFile = (config: NeptunoConfig): string => {
  const lines: string[] = [
    `PROJECT_NAME=${config.project.name}`,
    `DOMAIN=${config.project.domain}`,
    `PROXY=${config.project.proxy}`,
    "",
    "# Project Features",
    `DEMO_SITE=${config.project.isDemo}`,
    `DEFAULT_TEMPLATES=${config.project.hasTemplates}`,
    `SDK=${config.project.hasSDK}`,
    `CACHE=${config.project.hasCache}`,
    `GRAPHQL=${config.project.hasGraphQL}`,
    `DOCS=${config.project.hasDocs}`,
    "",
    "# Admin Credentials",
    `ADMIN_EMAIL=${config.project.adminEmail}`,
    `ADMIN_PASSWORD=${config.project.adminPassword}`,
    "",
    "# Environment",
    `ENVIRONMENT=${config.environment.mode}`,
    `DEBUG=${config.environment.debug}`,
    "",
    "# Server Backend",
    `HOST=${config.server.host}`,
    `PORT=${config.server.port}`,
    "",
    `DB_TYPE=${config.server.dbType}`,
    `DB_HOST=${config.server.dbHost}`,
    `DB_PORT=${config.server.dbPort}`,
    `DB_USER=${config.server.dbUser}`,
    `DB_PASSWORD=${config.server.dbPassword}`,
    `DB_NAME=${config.server.dbName}`,
    "",
    "# Authentication",
    `GOOGLE_CUSTOMER_ID=${config.auth.googleCustomerId}`,
    `GOOGLE_CUSTOMER_SECRET=${config.auth.googleCustomerSecret}`,
    `GOOGLE_REDIRECTIONAL_URI=${config.auth.googleRedirectUri}`,
    `META_ID_CLIENT_OF_YOUR_APP=${config.auth.metaClientId}`,
    `CUSTOMER_SECRET_OF_YOUR_APP=${config.auth.metaClientSecret}`,
    `META_REDIRECTIONAL_URI=${config.auth.metaRedirectUri}`,
    "",
    "# Redis",
    `HOST_REDIS=${config.redis.host}`,
    `REDIS_PORT=${config.redis.port}`,
    "",
    "# Frontend",
    `URL=${config.frontend.url}`,
    `HOST=${config.frontend.host}`,
    `PUBLIC_API_URL=${config.frontend.publicApiUrl}`,
    `SECRET_KEY=${config.frontend.secretKey}`,
    `DESKTOP=${config.frontend.desktop}`,
    "",
    "# Load Balancing",
    `LOAD_BALANCING_ENABLED=${config.server.loadBalancing.enabled}`,
    `BACKEND_KEEP_ALIVE=${config.server.loadBalancing.backendKeepAlive}`,
    `BACKEND_PORT=${config.server.loadBalancing.backendPort}`,
    `FRONTEND_PORTS=${config.server.loadBalancing.frontendPorts.join(",")}`,
    `BALANCING_METHOD=${config.server.loadBalancing.balancingMethod}`,
  ];

  return lines.join("\n");
};

export const downloadEnvFile = (content: string) => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = ".env";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
