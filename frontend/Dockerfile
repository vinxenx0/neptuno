# Etapa 1: Construcción de la app Next.js
FROM node:18-alpine AS builder

WORKDIR /neptuno

# Copia dependencias y las instala
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copia todo el código fuente y construye el frontend
COPY . .
RUN npm run build

# Etapa 2: Servir con Nginx
FROM nginx:alpine

# Copiar el build generado al directorio de Nginx
COPY --from=builder /app/out /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
