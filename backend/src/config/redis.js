import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

/**
 * In-memory fallback cache in case Redis is not running or unconfigured.
 * Structure: Map<key, { value: any, expiresAt: number | null }>
 */
const memoryCache = new Map();

let redisClient = null;
let isConnected = false;
let hasWarnedFallback = false;

const redisTarget = env.REDIS_URL;

if (redisTarget) {
  try {
    redisClient = new Redis(redisTarget, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      connectTimeout: 2000,
      retryStrategy: (times) => {
        if (times > 3) return null; // stop reconnecting after 3 attempts
        return Math.min(times * 200, 1000);
      }
    });

    redisClient.on('connect', () => {
      isConnected = true;
      logger.info('Connected to Redis cache server.');
    });

    redisClient.on('error', (err) => {
      isConnected = false;
      if (!hasWarnedFallback) {
        logger.warn(`Redis connection error: ${err.message}. Using resilient in-memory cache fallback.`);
        hasWarnedFallback = true;
      }
    });

    redisClient.on('close', () => {
      isConnected = false;
    });

    // Fire non-blocking connection attempt
    redisClient.connect().catch(() => {
      isConnected = false;
    });
  } catch (err) {
    logger.warn(`Failed to initialize Redis client: ${err.message}. Operating with in-memory cache.`);
    redisClient = null;
  }
} else {
  // No REDIS_URL provided — intentional fallback for development/test environments
  logger.info('No REDIS_URL configured; operating with resilient in-memory cache fallback.');
}

/**
 * Clean expired keys from memory cache periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of memoryCache.entries()) {
    if (entry.expiresAt && entry.expiresAt <= now) {
      memoryCache.delete(key);
    }
  }
}, 60000).unref();

/**
 * Checks whether Redis is actively connected.
 * @returns {boolean}
 */
export function isRedisAvailable() {
  return isConnected && redisClient !== null && redisClient.status === 'ready';
}

/**
 * Retrieves a cached value by key from Redis or in-memory fallback.
 * @param {string} key
 * @returns {Promise<any|null>}
 */
export async function cacheGet(key) {
  if (isRedisAvailable()) {
    try {
      const data = await redisClient.get(key);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch {
      // Fall through to memory cache
    }
  }

  // Fallback to memory cache
  const entry = memoryCache.get(key);
  if (!entry) return null;

  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    memoryCache.delete(key);
    return null;
  }

  return entry.value;
}

/**
 * Sets a key-value pair in Redis or in-memory fallback with TTL in seconds.
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlSeconds=3600] Default 1 hour
 * @returns {Promise<boolean>}
 */
export async function cacheSet(key, value, ttlSeconds = 3600) {
  const serialized = JSON.stringify(value);

  if (isRedisAvailable()) {
    try {
      if (ttlSeconds > 0) {
        await redisClient.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await redisClient.set(key, serialized);
      }
      return true;
    } catch {
      // Fall through to memory cache
    }
  }

  // Fallback to memory cache
  const expiresAt = ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null;
  memoryCache.set(key, { value, expiresAt });
  return true;
}

/**
 * Deletes a key from cache.
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export async function cacheDel(key) {
  memoryCache.delete(key);

  if (isRedisAvailable()) {
    try {
      await redisClient.del(key);
      return true;
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Clears all memory cache (primarily useful for unit testing).
 */
export function clearMemoryCache() {
  memoryCache.clear();
}
