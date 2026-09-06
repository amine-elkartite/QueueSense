# QueueSense API

> **Know the wait before you go.**

QueueSense is a production-oriented full-stack queue intelligence platform for restaurants, cafés, banks, hospitals, administrations, garages, salons, gyms, clinics, stores and other physical locations. Businesses publish live queue information; developers consume current wait times, crowd levels, history and statistical predictions through API keys; administrators operate the platform from a role-aware SaaS dashboard.

**Author:** Amine ELKARTITE  
**GitHub:** https://github.com/amine-elkartite  
**Version:** 1.0.0

## What is implemented

- Node.js + TypeScript + Express REST API
- Prisma ORM with a normalized MySQL 8 data model
- JWT access/refresh authentication with refresh-token rotation
- BUSINESS, DEVELOPER and ADMIN role authorization
- Secure QueueSense API keys (`qs_live_...`) stored only as SHA-256 hashes + prefixes
- Plan-aware API key rate limiting with Redis acceleration and DB fallback
- Redis caching for wait-time responses, current queue state and rate counters
- Graceful Redis degradation: core API remains operational when Redis is unavailable
- Socket.IO live updates using `location:{locationId}` rooms
- Real statistical prediction engine with a replaceable predictor interface
- Current, +30 minute, +1 hour and target-time prediction methods
- Best-time and avoid-time suggestions respecting opening hours
- Queue history analytics for hour/day/week intervals
- Location search, filters, Haversine nearby search and distance/wait sorting
- Live dashboard metrics backed by the real database
- Developer API-key management UI
- Business location and queue management UI
- Admin user, plan, subscription, incident and API usage endpoints
- Swagger / OpenAPI documentation at `/docs`
- Winston structured logging
- Helmet, CORS, Zod validation and centralized error handling
- Docker Compose for MySQL, Redis, API and dashboard
- GitHub Actions CI for lint, typecheck, tests and build
- Moroccan demo seed data with 15 locations and 100+ historical queue snapshots

## Architecture

```text
Browser / Mobile App / Third-party Developer
          │
          ├──────── JWT ─────────────┐
          └────── X-API-Key ────────┤
                                     ▼
                         Express + TypeScript API
                         ├── Auth / RBAC middleware
                         ├── Zod validation
                         ├── Controllers
                         ├── Services
                         ├── Repositories
                         ├── Prediction engine
                         ├── API usage / rate limiting
                         └── Socket.IO
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
              MySQL 8       Redis      WebSocket clients
              Prisma        Cache      location:{id}
```

More detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Technology stack

| Layer | Technology |
|---|---|
| API | Node.js, TypeScript, Express.js |
| ORM / DB | Prisma, MySQL 8 |
| Cache | Redis |
| Realtime | Socket.IO |
| Auth | JWT, bcrypt, refresh-token rotation |
| Validation | Zod |
| Security | Helmet, CORS, rate limits |
| Docs | Swagger / OpenAPI |
| Logging | Winston |
| Dashboard | React, TypeScript, Vite, React Router, Axios, TanStack Query |
| Charts / UI | Recharts, Lucide Icons, custom CSS |
| Testing | Vitest, Supertest |
| DevOps | Docker, Docker Compose, GitHub Actions |

## Project structure

```text
queuesense/
├── api/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── prediction/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── sockets/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── dashboard/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── Dockerfile
│   └── .env.example
├── docs/
├── .github/workflows/ci.yml
├── docker-compose.yml
├── package.json
├── README.md
└── LICENSE
```

## Quick start with Docker

Requirements: Docker Desktop or Docker Engine with Compose v2.

```bash
git clone https://github.com/amine-elkartite/QueueSense.git
cd QueueSense
docker compose up --build
```

Services:

- Dashboard: `http://localhost:5173`
- API base: `http://localhost:4000/api/v1`
- Swagger: `http://localhost:4000/docs`
- Health: `http://localhost:4000/health`
- MySQL: `localhost:3306`
- Redis: `localhost:6379`

The API container applies the Prisma schema and seeds demo data during startup.

## Local development without Docker

Requirements: Node.js 22+, MySQL 8+, Redis 7+.

```bash
npm install
cp api/.env.example api/.env
cp dashboard/.env.example dashboard/.env
```

Create a database and update `api/.env`:

```env
DATABASE_URL=mysql://root:password@localhost:3306/queuesense
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=replace-with-another-long-random-secret
```

Then:

```bash
npm run prisma:generate -w api
npm run prisma:push -w api
npm run seed -w api
npm run dev
```

## Environment variables

### API

```env
PORT=4000
DATABASE_URL=mysql://queuesense:queuesense@localhost:3306/queuesense
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET=replace-with-a-long-random-access-secret
JWT_REFRESH_SECRET=replace-with-a-long-random-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
LOG_LEVEL=info
```

### Dashboard

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_SOCKET_URL=http://localhost:4000
```

Never commit real secrets. `.env` files are ignored.

## Demo credentials

| Role | Email | Password |
|---|---|---|
| ADMIN | `admin@queuesense.dev` | `Password123!` |
| BUSINESS | `business@queuesense.dev` | `Password123!` |
| DEVELOPER | `developer@queuesense.dev` | `Password123!` |

All seed passwords are hashed with bcrypt before storage.

## Authentication

Register:

```http
POST /api/v1/auth/register
Content-Type: application/json
```

```json
{
  "firstName": "Amine",
  "lastName": "ELKARTITE",
  "email": "amine@example.com",
  "password": "StrongPassword123!",
  "role": "DEVELOPER"
}
```

Login:

```http
POST /api/v1/auth/login
```

The response contains a short-lived access token and a rotating refresh token. JWT access tokens are sent as:

```http
Authorization: Bearer <access-token>
```

Refresh tokens are stored server-side only as hashes. On refresh, the old token is revoked and replaced.

## API keys

Authenticated DEVELOPER or ADMIN users can create keys:

```http
POST /api/v1/developer/api-keys
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "name": "My mobile application"
}
```

A key looks like `qs_live_...`. The complete secret is returned only once. Only `keyHash` and `keyPrefix` are persisted.

Developer data API request:

```http
GET /api/v1/wait-time/demo-location-1-1
X-API-Key: qs_live_xxxxxxxxxxxxxxxxx
```

Example response:

```json
{
  "success": true,
  "data": {
    "location": {
      "id": "demo-location-1-1",
      "name": "Café Atlas",
      "city": "Taza"
    },
    "current": {
      "peopleWaiting": 12,
      "estimatedWaitTime": 18,
      "crowdLevel": "HIGH"
    },
    "prediction": {
      "in30Minutes": 12,
      "in1Hour": 7
    },
    "confidence": 0.87
  },
  "meta": {}
}
```

## Main API endpoints

| Method | Endpoint | Auth |
|---|---|---|
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | Refresh token |
| GET | `/api/v1/auth/me` | JWT |
| GET/POST | `/api/v1/developer/api-keys` | JWT Developer/Admin |
| DELETE | `/api/v1/developer/api-keys/:id` | JWT Developer/Admin |
| POST | `/api/v1/developer/api-keys/:id/regenerate` | JWT Developer/Admin |
| GET/POST | `/api/v1/businesses` | JWT Business/Admin |
| GET/PATCH | `/api/v1/businesses/:id` | JWT Business/Admin |
| POST/GET | `/api/v1/businesses/:id/locations` | JWT Business/Admin |
| PATCH/DELETE | `/api/v1/locations/:id` | JWT Business/Admin |
| POST | `/api/v1/locations/:locationId/queue` | JWT Business/Admin |
| GET | `/api/v1/wait-time/:locationId` | API key |
| GET | `/api/v1/locations/:id/best-time` | API key |
| GET | `/api/v1/locations/:id/history` | API key |
| GET | `/api/v1/locations/search` | API key |
| GET | `/api/v1/locations/nearby` | API key |
| GET | `/api/v1/dashboard/stats` | JWT |
| GET | `/api/v1/dashboard/live-queues` | JWT |
| GET | `/api/v1/dashboard/predictions` | JWT |
| GET | `/api/v1/dashboard/api-usage` | JWT |
| GET/PATCH | `/api/v1/admin/users` | Admin JWT |
| GET | `/api/v1/admin/businesses` | Admin JWT |
| GET/POST | `/api/v1/admin/plans` | Admin JWT |
| GET/POST | `/api/v1/admin/incidents` | Admin JWT |

## Queue updates and prediction

Businesses post live state:

```json
{
  "peopleWaiting": 12,
  "peopleBeingServed": 3,
  "averageServiceTime": 4
}
```

QueueSense stores a snapshot, calculates wait time, invalidates cache and emits real-time events. `StatisticalWaitTimePredictor` blends queue/service capacity with historical same-hour data, recent trends, capacity and active incidents. The implementation follows the `WaitTimePredictor` interface so an ML model can replace it later.

## Crowd levels

QueueSense produces `LOW`, `MODERATE`, `HIGH`, or `VERY_HIGH` using a weighted load score derived from capacity utilization and wait-time pressure relative to historical wait.

## Best time to visit

`GET /api/v1/locations/:id/best-time?date=2026-09-06` evaluates 30-minute intervals inside opening hours, returning the three lowest predicted waits and three times to avoid.

## Real-time Socket.IO

Connect to `http://localhost:4000` and subscribe:

```ts
socket.emit('subscribe', { locationId: 'demo-location-1-1' });
```

Room: `location:{locationId}`

Events:

- `queue:update`
- `wait-time:update`
- `crowd:update`
- `incident:update`

See [docs/WEBSOCKETS.md](docs/WEBSOCKETS.md).

## Rate limits

| Plan | Request limit |
|---|---:|
| FREE | 100/day |
| STARTER | 10,000/month |
| PRO | 100,000/month |
| BUSINESS | 1,000,000/month |

Limits are counted by API key. Redis accelerates counters and MySQL usage records provide fallback. Exceeding the plan returns HTTP `429`.

## Standard responses

Success:

```json
{"success":true,"data":{},"meta":{}}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "LOCATION_NOT_FOUND",
    "message": "Location not found"
  }
}
```

## Testing and validation

Run the complete quality pipeline:

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

API only:

```bash
npm test -w api
npm run typecheck -w api
npm run build -w api
```

Dashboard-only:

```bash
npm run typecheck -w dashboard
npm run build -w dashboard
```

## Docker validation

```bash
docker compose config
```

Start all services:

```bash
docker compose up --build
```

Stop:

```bash
docker compose down
```

Delete persisted demo DB/Redis data:

```bash
docker compose down -v
```

## API documentation

Interactive Swagger UI:

```text
http://localhost:4000/docs
```

Additional human-readable docs:

- [Architecture](docs/ARCHITECTURE.md)
- [API guide](docs/API.md)
- [WebSockets](docs/WEBSOCKETS.md)
- [Security](docs/SECURITY.md)
- [Development](docs/DEVELOPMENT.md)
- [Deployment](docs/DEPLOYMENT.md)

## Seed data

Moroccan demo cities:

- Taza
- Fès
- Rabat
- Casablanca
- Marrakech
- Tangier

Demo businesses include Café Atlas, Barber House, AutoFix Garage, Clinique Al Amal, Bank Center and FitZone Gym. The seed creates 10 categories, 10 businesses, 15 locations and more than 100 queue snapshots.

## Roadmap

1. Train an ML predictor implementing `WaitTimePredictor`.
2. Add sensor/webhook ingestion adapters.
3. Add organization teams and granular business permissions.
4. Add billing provider integration for plan upgrades.
5. Add geospatial database indexing for very large location datasets.
6. Add push notifications for wait-time thresholds.
7. Add mobile SDKs for TypeScript, Flutter and Swift.

## License

MIT — see [LICENSE](LICENSE).
