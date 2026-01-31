import { Server } from "socket.io";

let io = null;

export function setIO(server) {
  io = server;
}

export function getIO() {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
}

export function disconnectSocket(socketId) {
  if (!io) return;
  const sock = io.sockets.sockets.get(socketId );
  if (sock) sock.disconnect(true);
}

export function emitToSocket(socketId, event, payload) {
  if (!io) return;
  io.to(socketId).emit(event, payload);
}
