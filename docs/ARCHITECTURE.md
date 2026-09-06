# QueueSense Architecture

QueueSense separates HTTP transport, validation, authorization, business services, persistence and prediction logic. Express controllers stay thin, Prisma is the source of truth, Redis is an optional accelerator, and Socket.IO provides event-driven updates.

## Request path

1. Helmet/CORS/body parsing and request logging.
2. JWT or `X-API-Key` authentication depending on the endpoint.
3. Zod validation.
4. Controller orchestration.
5. Service/repository and prediction engine.
6. Prisma transaction/data access.
7. Standard response envelope.

## Prediction engine

`WaitTimePredictor` is the substitution boundary. `StatisticalWaitTimePredictor` combines current queue load, service concurrency, service duration, same-day/hour history, recent trend, capacity and active incidents. A future ML predictor can implement the same interface without changing controllers.

## Redis degradation

Redis stores 30-second wait-time cache, current queue state, prediction-related cache candidates, and fast rate counters. All Redis calls use a safe fallback path; MySQL remains authoritative.

## Real time

Socket clients subscribe to `location:{locationId}` rooms. Queue writes broadcast `queue:update`, `wait-time:update`, and `crowd:update`. Incident updates can use the same room/event scheme.
