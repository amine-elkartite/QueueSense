import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

let healthy = false;
export const redis = new Redis(env.REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 1, enableOfflineQueue: false });
redis.on('ready', () => { healthy = true; });
redis.on('close', () => { healthy = false; });
redis.on('error', (err) => logger.warn('Redis failure', { message: err.message }));
export const isRedisHealthy = () => healthy;
export async function connectRedis() { try { await redis.connect(); healthy = true; } catch (e) { healthy = false; logger.warn('Redis unavailable; continuing without cache'); } }
export async function safeRedis<T>(fn: () => Promise<T>, fallback: T): Promise<T> { try { if (!healthy) return fallback; return await fn(); } catch { return fallback; } }
