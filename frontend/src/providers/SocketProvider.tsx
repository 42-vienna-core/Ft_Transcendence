'use client'

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useSocket } from "../socket/socket";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
    isConnected: boolean;
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({
    token,
    children,
}: {
    token: string | null | undefined;
    children: React.ReactNode;
}) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {

        if (!token) return;

        const socketUrl = process.env.FRONTEND_URL

        const socket = io(socketUrl, {
            auth: {
                token: token 
            },
            autoConnect: true
        });

        socketRef.current = socket;
        const handleConnect = () => {
            console.log("✅ Socket connected!", socket.id);
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            console.log("❌ Socket disconnected");
            setIsConnected(false);
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
            socketRef.current = null;
        };
    }, [token]);

    return (
        <SocketContext.Provider 
            value={{
                isConnected,
                socket: socketRef.current,
            }}
        >
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