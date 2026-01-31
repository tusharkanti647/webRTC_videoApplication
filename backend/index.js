

import http from "http";
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDb from './utils/db.js';

import userRoute from "./routes/userRoutes.js";
import roomsRoute from './routes/romeRoutes.js'
import { Server } from 'socket.io';
import { setIO } from './socket/socketManager.js';
import { initSocket } from './socket/socket.js';
// import quizRoute from "./routes/quizRoutes.js";

dotenv.config({});

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const corsOptions = {
  origin: ['http://localhost:3000',], //'http://localhost:3000' 'https://quiz-app-tushar.web.app'],
  credentials: true,
}
app.use(cors(corsOptions));


app.use("/userApi", userRoute);
app.use("/roomsApi", roomsRoute);

const PORT = process.env.PORT || 8000


const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_BASE_URL || "*" },
});

setIO(io);
initSocket(io);

server.listen(PORT, () => {
  connectDb();
  console.log(`Backend listening on ${PORT}`);
});



/*
import http from "http";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./utils/db.js";

import userRoute from "./routes/userRoutes.js";
import { Server } from "socket.io";
import { setIO } from "./socket/socketManager.js";
import { initSocket } from "./socket/socket.js";

dotenv.config({});

const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: ["http://localhost:3000"],
  credentials: true,
};

app.use(cors(corsOptions));

// routes
app.use("/userApi", userRoute);

const PORT = process.env.PORT || 8000;

// ✅ HTTP SERVER (important)
const server = http.createServer(app);

// ✅ SOCKET.IO ATTACHED CORRECTLY
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_BASE_URL || "http://localhost:3000",
    credentials: true,
  },
});

setIO(io);
initSocket(io);

// ✅ LISTEN USING server (not app)
server.listen(PORT, () => {
  connectDb();
  console.log(`Backend listening on ${PORT}`);
});
*/