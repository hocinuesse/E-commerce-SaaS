import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace("/api/v1", "") ||
  "http://localhost:5000";

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

export const joinShopRoom = (shopId: string): void => {
  const s = getSocket();
  if (s && shopId) {
    s.emit("join_shop", shopId);
  }
};

export const leaveShopRoom = (shopId: string): void => {
  const s = getSocket();
  if (s && shopId) {
    s.emit("leave_shop", shopId);
  }
};

export const joinUserRoom = (userId: string): void => {
  const s = getSocket();
  if (s && userId) {
    s.emit("join_user", userId);
  }
};

