
import { NeptunoConfig } from "@/types/config";

export const generateDockerComposeFile = (dockerConfig: NeptunoConfig["docker"]): string => {
  const lines: string[] = [
    "version: '3.8'",
    "",
    "services:",
    "  backend:",
    "    container_name: neptuno-stack",
    "    build: ./backend",
    "    ports:", 
    "      - \"8000:8000\"",
    "    environment:",
    `      - WORKERS_PER_CORE=${dockerConfig.backend.workersPerCore}`,
    `      - MAX_WORKERS=${dockerConfig.backend.maxWorkers}`
  ];

  if (dockerConfig.backend.maxThreads) {
    lines.push(`      - MAX_THREADS=${dockerConfig.backend.maxThreads}`);
  }

  if (dockerConfig.backend.maxRequests) {
    lines.push(`      - MAX_REQUESTS=${dockerConfig.backend.maxRequests}`);
  }

  lines.push(
    "    volumes:",
    "      - backend_data:/app/data",
    "      - backend_logs:/app/logs",
    "    depends_on:",
    "      - db",
    "    restart: always",
    "    networks:",
    "      vboxnet:",
    "        ipv4_address: 172.18.0.2",
    "",
    "  frontend:",
    "    container_name: neptuno-dashboard",
    "    build: ./frontend",
    "    ports:",
    "      - \"3000:3000\""
  );

  if (dockerConfig.frontend.replicas) {
    lines.push(`    deploy:\n      replicas: ${dockerConfig.frontend.replicas}`);
  }

  if (dockerConfig.frontend.cpuLimit || dockerConfig.frontend.memoryLimit) {
    if (!lines.includes("    deploy:")) {
      lines.push("    deploy:");
    }
    lines.push("      resources:");
    lines.push("        limits:");
    if (dockerConfig.frontend.cpuLimit) {
      lines.push(`          cpus: '${dockerConfig.frontend.cpuLimit}'`);
    }
    if (dockerConfig.frontend.memoryLimit) {
      lines.push(`          memory: ${dockerConfig.frontend.memoryLimit}M`);
    }
  }

  lines.push(
    "    depends_on:",
    "      - backend",
    "    volumes:",
    "      - frontend_logs:/app/logs",
    "    restart: always",
    "    networks:",
    "      vboxnet:",
    "        ipv4_address: 172.18.0.3",
    "",
    "  db:"
  );

  switch (dockerConfig.database.type) {
    case "mariadb":
      lines.push("    image: mariadb:10.11");
      break;
    case "mysql":
      lines.push("    image: mysql:8.0");
      break;
    case "postgres":
      lines.push("    image: postgres:15");
      break;
  }

  lines.push(
    "    restart: always",
    `    container_name: neptuno-db`
  );

  if (dockerConfig.database.type === "mariadb" || dockerConfig.database.type === "mysql") {
    lines.push("    command: --innodb_buffer_pool_size=512M --query_cache_size=64M --tmp_table_size=64M");
  }

  lines.push("    environment:");
  
  if (dockerConfig.database.type === "postgres") {
    lines.push(`      - POSTGRES_PASSWORD=${dockerConfig.database.rootPassword}`);
    if (dockerConfig.database.database) {
      lines.push(`      - POSTGRES_DB=${dockerConfig.database.database}`);
    }
    if (dockerConfig.database.user) {
      lines.push(`      - POSTGRES_USER=${dockerConfig.database.user}`);
    }
  } else if (dockerConfig.database.type === "mariadb") {
    lines.push(`      - MARIADB_ROOT_PASSWORD=${dockerConfig.database.rootPassword}`);
    if (dockerConfig.database.database) {
      lines.push(`      - MARIADB_DATABASE=${dockerConfig.database.database}`);
    }
    if (dockerConfig.database.user && dockerConfig.database.password) {
      lines.push(`      - MARIADB_USER=${dockerConfig.database.user}`);
      lines.push(`      - MARIADB_PASSWORD=${dockerConfig.database.password}`);
    }
  } else if (dockerConfig.database.type === "mysql") {
    lines.push(`      - MYSQL_ROOT_PASSWORD=${dockerConfig.database.rootPassword}`);
    if (dockerConfig.database.database) {
      lines.push(`      - MYSQL_DATABASE=${dockerConfig.database.database}`);
    }
    if (dockerConfig.database.user && dockerConfig.database.password) {
      lines.push(`      - MYSQL_USER=${dockerConfig.database.user}`);
      lines.push(`      - MYSQL_PASSWORD=${dockerConfig.database.password}`);
    }
  }
  
  const dbPort = dockerConfig.database.type === "postgres" ? "5432" : "3306";
  const volumeName = dockerConfig.database.type === "postgres" ? "postgres_data" : 
                    (dockerConfig.database.type === "mariadb" ? "mariadb_data" : "mysql_data");
  const volumePath = dockerConfig.database.type === "postgres" ? "/var/lib/postgresql/data" : "/var/lib/mysql";
                    
  lines.push(
    `    ports:`,
    `      - "${dbPort}:${dbPort}"`,
    "    volumes:",
    `      - ${volumeName}:${volumePath}`,
    "    networks:",
    "      vboxnet:",
    "        ipv4_address: 172.18.0.4",
    "",
    "networks:",
    "  vboxnet:",
    "    driver: bridge",
    "    ipam:",
    "      config:",
    "        - subnet: \"172.18.0.0/16\"",
    "          gateway: \"172.18.0.1\"",
    "",
    "volumes:",
    "  backend_data:",
    "  backend_logs:",
    "  frontend_logs:",
    `  ${volumeName}:`
  );

  return lines.join("\n");
};
