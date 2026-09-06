# Security

QueueSense hashes user passwords with bcrypt and API keys / refresh tokens with SHA-256 before persistence. Access JWTs are short-lived, refresh tokens rotate, API keys are rate limited by plan, Prisma parameterizes SQL, Zod validates inputs, Helmet sets secure HTTP headers, CORS is explicit, and production errors do not expose stack traces. Logs intentionally exclude passwords, JWTs, refresh tokens and complete API keys.

For production, replace every example secret, run behind TLS, use a managed database with backups, configure secure Redis networking, and rotate credentials regularly.
