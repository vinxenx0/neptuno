FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .

# Debug: Verify files exist
RUN ls -la src/lib/ && \
    ls -la src/lib/auth/

RUN npm run build

FROM nginx:alpine
# Copy from the correct output directory
COPY --from=builder /app/.next/static /usr/share/nginx/html/_next/static
COPY --from=builder /app/out /usr/share/nginx/html
COPY --from=builder /app/public /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]






