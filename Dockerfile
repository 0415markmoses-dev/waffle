# Stage 1 — build
FROM node:22 AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2 — serve
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback: all routes serve index.html
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

COPY --chmod=755 docker-entrypoint.sh /usr/local/bin/docker-entrypoint

EXPOSE 80
ENTRYPOINT ["docker-entrypoint"]
CMD ["nginx", "-g", "daemon off;"]
