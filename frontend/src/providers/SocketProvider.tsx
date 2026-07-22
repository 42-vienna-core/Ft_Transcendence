'use client'

import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

interface SocketContextType {
    isConnected: boolean;
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const {data: session} = useSession();
    const token = session?.accessToken;

    useEffect(() => {
        if (!token) return;

        let socketInstance: Socket | null = null;

        try {
            if (!socketUrl) {
                throw new Error("NEXT_PUBLIC_SOCKET_URL is not defined in environment variables");
            }

            socketInstance = io(socketUrl, {
                auth: { token },
                autoConnect: true
            });

            const onConnect = () => {
                console.log("✅ Socket connected!", socketInstance?.id);
                setIsConnected(true);
            };

            const onDisconnect = () => {
                console.log("❌ Socket disconnected");
                setIsConnected(false);
            };

            socketInstance.on("connect", onConnect);
            socketInstance.on("disconnect", onDisconnect);

            setSocket(socketInstance);

        } catch (error: any) {
            console.error("🚨 Failed to initialize socket connection:", error.message || error);
        }

        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
            setSocket(null);
            setIsConnected(false);
        };
    }, [token]);

    return (
        <SocketContext.Provider value={{ isConnected, socket }}>
            {children}
        </SocketContext.Provider>
    );
}

export const useGameSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useGameSocket must be used strictly inside the SocketProvider');
  }
  return context;
};
