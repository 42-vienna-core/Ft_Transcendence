import { io } from "socket.io-client";

const SocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:2000";
export const socket = io(SocketUrl, {
  
  withCredentials: true,
  autoConnect: false,
});

export function useSocket() {
  return socket;
}