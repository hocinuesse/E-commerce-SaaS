import Redis from "ioredis";
import logger from "./logger";

let redisClient: Redis | null = null;
let isRedisAvailable = false;

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

try {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times) => {
      if (times > 3) {
        if (isRedisAvailable) {
          logger.warn("⚠️ Redis connection failed. Running in fallback mode without cache.");
          isRedisAvailable = false;
        }
        return null; // Stop retrying
      }
      return Math.min(times * 100, 2000);
    },
  });

  redisClient.on("connect", () => {
    isRedisAvailable = true;
    logger.info("🟢 Redis connected successfully.");
  });

  redisClient.on("error", (err) => {
    if (isRedisAvailable) {
      logger.warn(`⚠️ Redis error: ${err.message}`);
    }
    isRedisAvailable = false;
  });
} catch (error: any) {
  logger.warn(`⚠️ Could not initialize Redis: ${error.message}`);
  isRedisAvailable = false;
}

export const getCache = async <T>(key: string): Promise<T | null> => {
  if (!isRedisAvailable || !redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch (err: any) {
    logger.warn(`Redis getCache error for key ${key}: ${err.message}`);
    return null;
  }
};

export const setCache = async (
  key: string,
  value: any,
  ttlSeconds: number = 300,
): Promise<void> => {
  if (!isRedisAvailable || !redisClient) return;
  try {
    await redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err: any) {
    logger.warn(`Redis setCache error for key ${key}: ${err.message}`);
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  if (!isRedisAvailable || !redisClient) return;
  try {
    await redisClient.del(key);
  } catch (err: any) {
    logger.warn(`Redis deleteCache error for key ${key}: ${err.message}`);
  }
};

export const clearCachePattern = async (pattern: string): Promise<void> => {
  if (!isRedisAvailable || !redisClient) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (err: any) {
    logger.warn(`Redis clearCachePattern error for pattern ${pattern}: ${err.message}`);
  }
};

export { redisClient, isRedisAvailable };

