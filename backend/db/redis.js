import { createClient } from 'redis';

const redisUrl =
  process.env.REDIS_URL ||
  `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

console.log('Connecting to Redis:', redisUrl);

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('connect', () => {
  console.log('Redis connecting...');
});

redisClient.on('ready', () => {
  console.log('Redis ready');
});

redisClient.on('error', (err) => {
  console.error('Redis Error:', err.message);
});

redisClient.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});

export default redisClient;
