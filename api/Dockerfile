FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY api/package*.json ./api/
COPY dashboard/package*.json ./dashboard/
RUN npm install

FROM deps AS build
COPY api ./api
RUN npm run prisma:generate -w api && npm run build -w api

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/api/package.json ./api/package.json
COPY --from=build /app/api/dist ./api/dist
COPY --from=build /app/api/prisma ./api/prisma
WORKDIR /app/api
EXPOSE 4000
CMD ["sh", "-c", "npx prisma db push && npm run seed && node dist/src/server.js"]
