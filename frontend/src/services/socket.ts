
import { io, type Socket } from "socket.io-client";
import { getToken } from "./api";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const SOCKET_URL = new URL(API_BASE_URL).origin;

let messagingSocket: Socket | null = null;
let socketToken: string | null = null;

export const connectMessagingSocket = (): Socket => {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in before opening messages.");
  }

  // Reuse the existing connection only when its token matches.
  if (messagingSocket && socketToken === token) {
    if (!messagingSocket.connected) {
      messagingSocket.connect();
    }

    return messagingSocket;
  }

  // Replace an existing socket if the signed-in user changed.
  if (messagingSocket) {
    messagingSocket.removeAllListeners();
    messagingSocket.disconnect();
    messagingSocket = null;
    socketToken = null;
  }

  const socket = io(SOCKET_URL, {
    autoConnect: false,
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  messagingSocket = socket;
  socketToken = token;

  socket.on("connect", () => {
    console.info("[Messaging] Connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.info("[Messaging] Disconnected:", reason);
  });

  socket.on("connect_error", (error) => {
    console.error("[Messaging] Connection failed:", error.message);
  });

  socket.connect();

  return socket;
};

export const disconnectMessagingSocket = (): void => {
  if (!messagingSocket) return;

  messagingSocket.removeAllListeners();
  messagingSocket.disconnect();

  messagingSocket = null;
  socketToken = null;
};

export const getMessagingSocket = (): Socket | null =>
  messagingSocket;
