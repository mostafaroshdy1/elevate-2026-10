import type { Server, Socket } from "socket.io";

/**
 * Data that gets attached to every socket after authentication.
 * - `userId` is required so the manager can track who is online.
 * - You can add any extra fields your project needs (role, name, etc.).
 */
export interface SocketAuthData {
  userId: string | number;
  [key: string]: unknown;
}

/**
 * A regular Socket, but with `.data` guaranteed to contain auth info.
 * After the auth middleware runs, every socket becomes an AuthSocket.
 */
export interface AuthSocket extends Socket {
  data: SocketAuthData;
}

/**
 * Options you pass when creating a new SocketManager.
 *
 * @example
 * const io = new SocketManager({
 *   cors: { origin: "http://localhost:3000" },
 *   authHandler: async (socket) => {
 *     const user = await verifyJWT(socket.handshake.auth?.token);
 *     return { userId: user.id, role: user.role };
 *   },
 * });
 */
export interface SocketManagerConfig {
  /** CORS settings passed directly to socket.io. */
  cors?: {
    origin: string | string[] | boolean;
    methods?: string[];
    credentials?: boolean;
  };

  /**
   * Called on every new connection to authenticate the user.
   * - Return user data (must include userId) to allow the connection.
   * - Throw an error to reject it.
   */
  authHandler?: (socket: Socket) => Promise<SocketAuthData>;

  /** Any extra socket.io server options (pingTimeout, maxHttpBufferSize, etc.). */
  serverOptions?: Record<string, unknown>;
}

/**
 * The function you pass to `io.onConnection()`.
 * It receives the authenticated socket and the raw server instance.
 *
 * @example
 * io.onConnection((socket, server) => {
 *   socket.on("chat:send", (msg) => { ... });
 * });
 */
export type ConnectionHandler = (socket: AuthSocket, io: Server) => void;
