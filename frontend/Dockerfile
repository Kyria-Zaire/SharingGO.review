# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app

# --- development (Vite dev server) ---
FROM base AS development
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev"]

# --- build static assets ---
FROM base AS build
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# --- production (nginx) ---
FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
