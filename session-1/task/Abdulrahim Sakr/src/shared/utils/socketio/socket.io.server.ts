import { Server, Socket } from "socket.io";
import { Server as httpServer } from "node:http";
import { decodeToken } from "../decode.token.js";
import { sendMessage } from "./listeners/chat.listener.js";

// ======================= socketIOServer =======================
export let ioServer: Server;

export const socketIoServer = (httpServer: httpServer) => {
  ioServer = new Server(httpServer, { cors: { origin: "*" } });

  ioServer.use((socket: any, next: any) => {
    authenticateMiddleware(socket, next);
  });

  ioServer.on("connection", (socket: any) => {
    connection(socket);

    socket.on("chat:sendMessage", (arg: any, callback: any) => {
      sendMessage(arg, callback);
    });

    socket.on("disconnecting", () => {
      disconnecting(socket);
    });
  });

  return ioServer;
};

// ======================= getIOServer =======================
export const getIOServer = () => {
  if (!ioServer) {
    throw new Error("Socket.IO not initialized");
  }
  return ioServer;
};

// ======================= authenticateMiddleware =======================
export function authenticateMiddleware(socket: any, next: any) {
  try {
    const payload = decodeToken({
      authorization: socket.handshake.auth.accessToken,
    });
    socket.payload = payload;
    next();
  } catch (err) {
    next(err as Error);
  }
}

// ======================= connection =======================
export function connection(socket: any) {
  const payload = socket.payload;
  const roomName = `user:${payload.userId}`;
  const room = ioServer.sockets.adapter.rooms.get(roomName);
  const roomSize = room?.size || 0;
  socket.join(roomName);
  if (roomSize === 0) {
    socket.broadcast.emit("user:online", { userId: payload.userId }); // send to everyone except current socket
  }
}

// ======================= disconnecting =======================
export function disconnecting(socket: any) {
  const payload = socket.payload;
  const roomName = `user:${payload.userId}`;
  const room = ioServer.sockets.adapter.rooms.get(roomName);
  const roomSize = room?.size || 0;
  // if size === 1
  // this socket is the last one
  if (roomSize === 1) {
    socket.broadcast.emit("user:offline", { userId: payload.userId }); // send to everyone except current socket
  }
}

// ======================= onlineSockets =======================
export function onlineSockets() {
  return ioServer.sockets.sockets; // return Map<string, Socket>
}

// ======================= onlineUsers =======================
export function onlineUsers(): number[] {
  const users: number[] = [];
  for (const roomName of ioServer.sockets.adapter.rooms.keys()) {
    // skip auto socket rooms
    if (!roomName.startsWith("user:")) continue;
    const userId = Number(roomName.replace("user:", ""));
    users.push(userId);
  }
  return users; // return [number, number, ...]
}

// ======================= userOnlineStatus =======================
export function userOnlineStatus(userId: number): boolean {
  return ioServer.sockets.adapter.rooms.has(`user:${userId}`); // return boolean
}

// ======================= userConnectionsCount =======================
export function userConnectionsCount(userId: number): number {
  return ioServer.sockets.adapter.rooms.get(`user:${userId}`)?.size || 0; // return number
}

// ======================= emitToUser =======================
export function emitToUser(userId: number, event: string, data: any) {
  ioServer.to(`user:${userId}`).emit(event, data);
}
