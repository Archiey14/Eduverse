
import { io, type Socket } from "socket.io-client";
import { getToken } from "./api";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const SOCKET_URL = new URL(API_BASE_URL).origin;

let messagingSocket: Socket | null = null;

export const connectMessagingSocket = (): Socket => {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in before opening messages.");
  }

  // Reuse the socket if it is already connected with the same token.
  if (messagingSocket) {
    const existingToken = messagingSocket.auth
      ? (messagingSocket.auth as { token?: string }).token
      : undefined;

    if (existingToken === token) {
      if (!messagingSocket.connected) {
        messagingSocket.connect();
      }

      return messagingSocket;
    }

    messagingSocket.disconnect();
    messagingSocket = null;
  }

  messagingSocket = io(SOCKET_URL, {
    autoConnect: false,
    auth: { token },
    transports: ["websocket", "polling"],
  });

  messagingSocket.connect();

  return messagingSocket;
};

export const disconnectMessagingSocket = (): void => {
  messagingSocket?.disconnect();
  messagingSocket = null;
};

export const getMessagingSocket = (): Socket | null =>
  messagingSocket;
