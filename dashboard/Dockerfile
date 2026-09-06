FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY dashboard/package*.json ./dashboard/
COPY api/package*.json ./api/
RUN npm install
COPY dashboard ./dashboard
RUN npm run build -w dashboard
FROM nginx:1.27-alpine
COPY --from=build /app/dashboard/dist /usr/share/nginx/html
COPY dashboard/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
