# QueueSense API Guide

Base URL: `http://localhost:4000/api/v1`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

Use JWT access tokens as `Authorization: Bearer <token>` for dashboard/business/admin endpoints.

## Developer API keys

- `GET /developer/api-keys`
- `POST /developer/api-keys`
- `DELETE /developer/api-keys/:id`
- `POST /developer/api-keys/:id/regenerate`

The full API key is returned only on creation/regeneration. QueueSense stores SHA-256 plus a visible prefix.

## Public/developer data API

Use `X-API-Key: qs_live_...`.

- `GET /wait-time/:locationId`
- `GET /locations/search`
- `GET /locations/nearby`
- `GET /locations/:id`
- `GET /locations/:id/history?from=&to=&interval=hour|day|week`
- `GET /locations/:id/best-time?date=YYYY-MM-DD`

## Queue update

`POST /locations/:locationId/queue` with BUSINESS or ADMIN JWT.

```json
{"peopleWaiting":12,"peopleBeingServed":3,"averageServiceTime":4}
```

## Standard responses

Success: `{ "success": true, "data": {}, "meta": {} }`

Error: `{ "success": false, "error": { "code": "LOCATION_NOT_FOUND", "message": "Location not found" } }`
