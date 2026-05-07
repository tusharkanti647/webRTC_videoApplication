// src/queues/email.queue.js
import { Queue } from "bullmq";

// Parse REDIS_URL into connection object
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const url = new URL(redisUrl);

const redisConnection = {
  host: url.hostname,
  port: parseInt(url.port || 6379),
};

export const emailQueue = new Queue("emailQueue", {
  connection: redisConnection,

  defaultJobOptions: {
    attempts: 5,

    backoff: {
      type: "exponential",
      delay: 5000,
    },

    removeOnComplete: 100,
    removeOnFail: 1000,
  },
});
