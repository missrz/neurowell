FROM node:18-alpine AS build
WORKDIR /app

# Copy package files first for layer caching
COPY package.json package-lock.json* ./

# Install dependencies (use npm install to avoid strict CI errors during container build)
RUN npm install --silent --no-audit --no-fund || npm install --silent

# Copy source and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Ensure files are readable by nginx worker (other/group)
RUN chmod -R a+r /usr/share/nginx/html && find /usr/share/nginx/html -type d -exec chmod a+rx {} + || true
EXPOSE 80
