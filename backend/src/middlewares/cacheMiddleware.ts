import { Request, Response, NextFunction } from "express";
import { getCache, setCache } from "../utils/redis";

export const cacheMiddleware = (durationInSeconds: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    const key = `cache:${req.originalUrl || req.url}`;
    try {
      const cachedResponse = await getCache<any>(key);
      if (cachedResponse) {
        res.setHeader("X-Cache", "HIT");
        return res.status(200).json(cachedResponse);
      }

      res.setHeader("X-Cache", "MISS");
      // Intercept res.json to store into Redis
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(key, body, durationInSeconds).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      next();
    }
  };
};

