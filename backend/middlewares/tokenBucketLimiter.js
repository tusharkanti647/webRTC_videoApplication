import redisClient from "../db/redis.js";

const LIMITS = {

  guest: {
    capacity: 100,
    refillRate: 1,
  },

  user: {
    capacity: 1000,
    refillRate: 5,
  },

  login: {
    capacity: 5,
    refillRate: 0.005,
  },

};

function getIP(req) {

  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    req.ip
  );

}

export async function rateLimiter(
  req,
  res,
  next
) {

  try {

    let type = "guest";

    let key;

    // ================= LOGIN ROUTE =================

    if (
      req.path.includes("/login")
    ) {

      type = "login";

      const email =
        req.body.email || "unknown";

      key = `rate:login:${email}:${getIP(req)}`;

    }

    // ================= AUTH USER =================

    else if (req.user?.id) {

      type = "user";

      key = `rate:user:${req.user.id}`;

    }

    // ================= GUEST =================

    else {

      key = `rate:guest:${getIP(req)}`;

    }

    const config = LIMITS[type];

    const now = Date.now();

    // ================= GET BUCKET =================

    const bucketRaw =
      await redisClient.get(key);

    let bucket;

    if (!bucketRaw) {

      bucket = {

        tokens: config.capacity,

        lastRefill: now,

      };

    } else {

      bucket = JSON.parse(bucketRaw);

    }

    // ================= REFILL =================

    const elapsed =
      (now - bucket.lastRefill) / 1000;

    const refill =
      elapsed * config.refillRate;

    bucket.tokens = Math.min(
      config.capacity,
      bucket.tokens + refill
    );

    bucket.lastRefill = now;

    // ================= CHECK =================

    if (bucket.tokens < 1) {

      return res.status(429).json({

        success: false,

        message: "Too many requests",

      });

    }

    // consume token
    bucket.tokens -= 1;

    // ================= SAVE =================

    await redisClient.set(

      key,

      JSON.stringify(bucket),

      {
        EX: 3600,
      }

    );

    next();

  } catch (error) {

    console.error(
      "Rate limiter error:",
      error
    );

    next();

  }

}