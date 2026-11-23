# Dockerfile (clinical frontend)
# Stage 1 builds the React app into plain files; stage 2 serves them with nginx.
# The API address comes from .env.production (VITE_API_URL), baked in by "npm run build".

# ---- Stage 1: build ----
FROM node:24-alpine AS build
WORKDIR /app

# Packages first, so Docker reuses this step when only the code changes
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build                 # creates /app/dist (uses .env.production)

# ---- Stage 2: serve ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
