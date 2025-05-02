
import { NeptunoConfig } from "@/types/config";

/**
 * Generates README.md content based on the configuration
 */
export function generateReadme(config: NeptunoConfig): string {
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

/**
 * Generates docker-compose.yml content based on the configuration
 */
export function generateDockerCompose(config: NeptunoConfig): string {
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

/**
 * Generates nginx.conf content based on the configuration
 */
export function generateNginxConfig(config: NeptunoConfig): string {
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
