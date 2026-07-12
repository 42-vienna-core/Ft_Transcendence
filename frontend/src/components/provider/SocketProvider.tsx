"use client";

import { useEffect } from "react";
import { useAuth } from "./UserProvider";
import { useSocket } from "../socket/socket";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { cntUser } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    if (!cntUser || socket.connected) return;

    socket.on("connect", async () =>  console.log("✅ Socket connected!", socket.id));
    socket.on("disconnect", async () => console.log("❌ Socket disconnected"));

    if (!socket.connected)  socket.connect();

    return () => {
        socket.off("connect");
        socket.off("disconnect");
    };

  }, []);

  return children;
}