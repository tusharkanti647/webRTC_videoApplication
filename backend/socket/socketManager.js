// Holds the Socket.IO server instance
// Initially null until the server is set
let io = null;

// Stores the Socket.IO server instance
// This should be called once after initializing socket.io
export function setIO(server) {
  io = server;
}

// Returns the Socket.IO server instance
// Throws an error if socket.io is not yet initialized
export function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

// Forcefully disconnects a socket using its socketId
// Useful when host kicks a user or user leaves the room
export function disconnectSocket(socketId) {
  if (!io) {
    return;
  }
  const sock = io.sockets.sockets.get(socketId);

  // Disconnect the socket
  // true → closes the connection and triggers 'disconnect' event
  if (sock) {
    sock.disconnect(true);
  }
}

// Emits an event to a specific socket only
// socketId → target user socket
// event    → event name
// payload  → data sent with the event
export function emitToSocket(socketId, event, payload) {
  if (!io) {
    return;
  }

  io.to(socketId).emit(event, payload);
}
