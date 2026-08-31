'use client'

import { useNotificationListener } from "@/components/store/notification";
import { useRoomDataBySocket } from "@/components/store/useRoomData";
import { SocketResponse } from "@/types/socketTypes";
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
    const openNotificationListener = useNotificationListener((state) => state.openNotificationListener);
    const { openRoomListener } = useRoomDataBySocket();
    
    const {data: session} = useSession();
    const token = session?.accessToken;

    let socketInstance: Socket | null = null;

    useEffect(() => {
        if (!token || socketInstance?.connected) return;

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

			const onSocketException = (response: SocketResponse) => {
				if (!response.success)
					console.log("Socket error: ", response.error);
			};

			const onConnectError = (error: Error) => {
				console.log("Socket connection error: ", error.message);
				setIsConnected(false);
			};

            socketInstance.on("connect", onConnect);
            socketInstance.on("disconnect", onDisconnect);

            socketInstance.on("exception", onSocketException);
            socketInstance.on("connect_error", onConnectError);

            setSocket(socketInstance);
            openNotificationListener(socketInstance);
            openRoomListener(socketInstance);

        } catch (error: any) {
            console.error("🚨 Failed to initialize socket connection:", error.message || error);
        }

        return () => {
            if (socketInstance) {
				socketInstance.removeAllListeners();
                socketInstance.disconnect();
            }
            setSocket(null);
            setIsConnected(false);
        };
    }, [token, socketInstance]);

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
