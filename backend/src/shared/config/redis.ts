import Redis from "ioredis";

const isTest = process.env.NODE_ENV === "test";
const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: isTest ? 0 : 3,
  lazyConnect: isTest,
  retryStrategy: (times) => {
    if (isTest) return null;
    if (times > 5) return null;
    return Math.min(times * 200, 2000);
  },
});

redis.on("error", (err) => {
  if (!isTest) {
    console.error("Redis connection error:", err.message);
  }
});

redis.on("connect", () => {
  if (!isTest) {
    console.log("Redis connected");
  }
});

export { redis };
