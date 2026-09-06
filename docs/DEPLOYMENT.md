# Deployment Guide

## Docker Compose

For a single-host deployment:

```bash
cp api/.env.example api/.env
cp dashboard/.env.example dashboard/.env
docker compose up --build -d
```

For production, use externally managed secrets rather than values committed to Compose, terminate TLS at a reverse proxy/load balancer, restrict MySQL/Redis network exposure, configure backups, and set `NODE_ENV=production`.

## Required services

- MySQL 8 compatible database
- Redis 7 compatible cache (application degrades safely when Redis is unavailable)
- Node.js API container
- Static dashboard served by Nginx

## Health monitoring

Probe `GET /health`. A MySQL failure returns degraded/503 because database access is essential. Redis failure is reported but does not stop the API process.

## CI

`.github/workflows/ci.yml` installs dependencies, generates Prisma Client, initializes the test database, seeds data, runs lint/typecheck/tests, and builds API and dashboard on push and pull request.
