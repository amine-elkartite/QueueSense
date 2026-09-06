# Development Guide

## Prerequisites

- Node.js 22+
- npm 10+
- MySQL 8+
- Redis 7+ (optional for core functionality, recommended)

## Setup

```bash
npm install
cp api/.env.example api/.env
cp dashboard/.env.example dashboard/.env
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev
```

The API runs on port 4000 and Vite on port 5173 by default.

## Quality checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Data changes

Edit `api/prisma/schema.prisma`, then run `npm run prisma:generate` and `npm run prisma:push`. For production teams, replace `db push` with reviewed Prisma migrations.

## Prediction development

Implement `WaitTimePredictor` in `api/src/prediction/types.ts`, inject the implementation into `PredictionEngine`, and add deterministic unit tests before switching production traffic.
