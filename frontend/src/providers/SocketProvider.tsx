'use client'

import { useEffect } from "react";
import { useSocket } from "../socket/socket";
import { useSession } from "next-auth/react";

export default function SocketProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const {data: status} = useSession();
    const socket = useSocket();

    useEffect(() => {
        if (!status) return;

        const handleConnect = () => {
            console.log("✅ Socket connected!", socket.id);
        };

        const handleDisconnect = () => {
            console.log("❌ Socket disconnected");
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.disconnect();
        };
    }, [status, socket]);

   return children;
}