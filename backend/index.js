import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';

import { Server } from 'socket.io';

import connectDb from './db/db.js';
import redisClient from './db/redis.js';

import userRoute from './modules/user/routes/userRoutes.js';
import roomsRoute from './modules/room/routes/romeRoutes.js';

import { setIO } from './socket/socketManager.js';
import { initSocket } from './socket/socket.js';
import { rateLimiter } from './middlewares/tokenBucketLimiter.js';
import { emailQueue } from './modules/services/queues/email.queue.js';

dotenv.config();

// ================= VALIDATE ENV =================

const requiredEnv = [
  'PORT',
  'FRONTEND_BASE_URL',
  'REDIS_HOST',
  'REDIS_PORT',
  // "REDIS_PASSWORD",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing ENV Variable: ${key}`);
    process.exit(1);
  }
}

// ================= EXPRESS APP =================

const app = express();

// const __filename = fileURLToPath(import.meta.url);
// console.log('JJJJJ', __filename)
// const __dirname = path.dirname(__filename);

// ================= SECURITY =================

// Hide express fingerprint
app.disable('x-powered-by');

// Secure headers
app.use(helmet());

// ================= PERFORMANCE =================

// Compress response
app.use(compression());

// ================= BODY PARSER =================

// Limit payload size against attacks
app.use(express.json({ limit: '1mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
  }),
);

app.use(cookieParser());

// ================= CORS =================

const allowedOrigins = [process.env.FRONTEND_BASE_URL];

app.use(
  cors({
    origin(origin, callback) {
      // allow mobile apps/postman
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('CORS blocked'));
    },

    credentials: true,
  }),
);

//=============== rate limitar ==============

app.use(rateLimiter);

// ================= API ROUTES =================

app.use('/userApi', userRoute);
app.use('/roomsApi', roomsRoute);

// ================= STATIC FILES =================

// const buildPath = path.join(__dirname, "build");

// app.use(express.static(buildPath, {
//   maxAge: "7d",
// }));

// ================= HEALTH CHECK =================

app.get('/health', async (req, res) => {
  try {
    await redisClient.ping();

    res.status(200).json({
      status: 'ok',
      redis: 'connected',
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
    });
  }
});

// ================= REACT FALLBACK =================

// app.get("*", (req, res) => {
//   res.sendFile(path.join(buildPath, "index.html"));
// });

// ================= HTTP SERVER =================

const server = http.createServer(app);

// ================= SOCKET IO =================

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },

  transports: ['websocket'],

  pingTimeout: 60000,

  pingInterval: 25000,
});

setIO(io);

initSocket(io);

// ================= START SERVER =================

const PORT = Number(process.env.PORT);

async function startServer() {
  try {
    // MongoDB
    await connectDb();

    console.log('MongoDB Connected');

    // Redis
    await redisClient.connect();

    console.log('Redis Connected');

    // Start server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Startup Error:', error);

    process.exit(1);
  }
}

// ===============================
//bull mq

// import { createBullBoard } from '@bull-board/api';
// import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
// import { ExpressAdapter } from '@bull-board/express';

// // import { emailQueue } from './queues/email.queue.js';

// const serverAdapter = new ExpressAdapter();

// serverAdapter.setBasePath('/admin/queues');

// createBullBoard({
//   queues: [new BullMQAdapter(emailQueue)],
//   serverAdapter,
// });

// export default serverAdapter;
// app.use('/admin/queues', serverAdapter.getRouter());
//=================================

startServer();

// const imiSend = () => {
//   emailQueue.add('sendEmail', {
//     to: 'tusharkanti647@gmail.com',
//     subject: 'Room Invite',
//     html: '<h1>Hello</h1>',
//   });
// };

// const laterSend = () => {
//   emailQueue.add(
//     'scheduledEmail',
//     {
//       to: 'tusharkanti647@gmail.com',
//       subject: 'Meeting Reminder',
//       html: '<h1>Reminder</h1>',
//     },

//     {
//       delay: 1000 * 60 * 2,
//     },
//   );
// };

// setTimeout(() => {
//   imiSend();
//   laterSend();
// }, 10000);

// ================= GRACEFUL SHUTDOWN =================

async function gracefulShutdown(signal) {
  console.log(`${signal} received`);

  try {
    await redisClient.quit();

    server.close(() => {
      console.log('HTTP Server Closed');

      process.exit(0);
    });
  } catch (error) {
    console.error('Shutdown Error:', error);

    process.exit(1);
  }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
