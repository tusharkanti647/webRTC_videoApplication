import { Queue } from 'bullmq';

// Parse REDIS_URL into connection object
const redisUrl =
  process.env.REDIS_URL ||
  `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
const url = new URL(redisUrl);

const redisConnection = {
  host: url.hostname,
  port: parseInt(url.port || 6379),
};

console.log('Backend Queue connecting to Redis:', redisConnection);

export const emailQueue = new Queue('emailQueue', {
  connection: redisConnection,
});
