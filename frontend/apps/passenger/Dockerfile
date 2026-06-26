# syntax=docker/dockerfile:1

# --- build ---
FROM node:22-alpine AS build
WORKDIR /app

# Activer corepack pour pnpm (nécessaire sur node:22-alpine)
# Épingler pnpm v9 — cohérent avec pnpm-lock.yaml lockfileVersion: 9.0
RUN corepack enable && corepack prepare pnpm@9 --activate

# Copier manifestes uniquement pour maximiser le cache Docker
COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

# Copier les sources
COPY . .

# Variables Vite build-time (inlinées dans le bundle par Vite)
# et variables pour le prebuild generate-robots.mjs
# Déclarées dans ce stage uniquement — jamais dans le stage production
ARG VITE_API_URL=https://api.sharinggo.fr
ARG VITE_GOOGLE_CLIENT_ID
ARG ROBOTS_POLICY=allow
ARG PUBLIC_SITE_URL=https://sharinggo.fr

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_GOOGLE_CLIENT_ID=${VITE_GOOGLE_CLIENT_ID}
ENV ROBOTS_POLICY=${ROBOTS_POLICY}
ENV PUBLIC_SITE_URL=${PUBLIC_SITE_URL}

# pnpm build déclenche prebuild (generate-robots.mjs) puis tsc --noEmit && vite build
RUN pnpm build

# --- production ---
FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
