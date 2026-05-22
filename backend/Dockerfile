# syntax=docker/dockerfile:1

# --- base ---
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# --- development (docker-compose.dev.yml) ---
FROM base AS development
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]

# --- deps (production install) ---
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate

# --- build ---
FROM deps AS build
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build
RUN npm prune --omit=dev

# --- production ---
FROM base AS production
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
EXPOSE 3000
CMD ["node", "dist/index.js"]
