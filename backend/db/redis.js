import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("connect", () => {
  console.log("Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("Redis ready");
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err.message);
});

redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

export default redisClient;