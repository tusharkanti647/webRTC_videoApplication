// src/workers/email.worker.js

import { Worker } from "bullmq";
import { sendEmail } from "../services/email.service.js";

// Parse REDIS_URL into connection object
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const url = new URL("redis://localhost:6379");

const redisConnection = {
  host: url.hostname,
  port: parseInt(url.port || 6379),
};

console.log("Email Worker connecting to Redis:", redisConnection);

new Worker(
  "emailQueue",

  async (job) => {
    const { to, subject, html, text } = job.data;

    console.log("Sending email:", to);

    await sendEmail({
      to,
      subject,
      html,
      text,
    });

    console.log("Email sent:", to);
  },

  {
    connection: redisConnection,

    concurrency: 5,

    limiter: {
      max: 10, // max 10 emails
      duration: 1000, // per second
    },
  },
);

console.log(" Email Worker Running...");
