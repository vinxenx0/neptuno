# Etapa de construcción
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 
                    # && npm run export

# Etapa de producción
FROM node:18-alpine AS production

WORKDIR /app
# Copiamos solo lo necesario desde el builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
# COPY --from=builder /app/out ./out
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# esto se mueve al otro contenedor
#COPY --from=builder nginx.conf /etc/nginx/nginx.conf
#COPY --from=builder nginx.conf /etc/nginx/sites-available/default
#RUN ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default
#RUN systemctl restart nginx

# Instalamos serve para servir la aplicación estática
# RUN npm install -g serve

EXPOSE 3000
#CMD ["serve", "-s", "out", "-l", "3000"]
#EXPOSE 3000
#EXPOSE 80
#CMD ["npm", "run", "start"]
#CMD ["nginx", "-g", "daemon off;"]
CMD ["npx", "next", "start"]








