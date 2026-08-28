'use client'

import { useNotificationListener } from "@/components/store/notification";
import { useRoomDataBySocket } from "@/components/store/useRoomData";
import { getErrorMessage } from "@/lib/error";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

const SOCKET_ERROR_TOAST_ID = "socket-connection";

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
                toast.dismiss(SOCKET_ERROR_TOAST_ID);
            };

            const onDisconnect = (reason: Socket.DisconnectReason) => {
                console.log("❌ Socket disconnected");
                setIsConnected(false);

                if (reason !== "io client disconnect") {
                    toast.error("Connection lost. Trying to reconnect...", { id: SOCKET_ERROR_TOAST_ID });
                }
            };

            const onConnectError = (error: Error) => {
                console.error("🚨 Socket connect_error:", error.message);
                toast.error("Unable to connect to the game server.", { id: SOCKET_ERROR_TOAST_ID });
            };

            const onException = (payload: unknown) => {
                const message = typeof payload === "object" && payload !== null && "message" in payload
                    ? getErrorMessage((payload as { message: unknown }).message)
                    : getErrorMessage(payload);

                toast.error(message);
            };

            socketInstance.on("connect", onConnect);
            socketInstance.on("disconnect", onDisconnect);
            socketInstance.on("connect_error", onConnectError);
            socketInstance.on("exception", onException);

            setSocket(socketInstance);
            openNotificationListener(socketInstance);
            openRoomListener(socketInstance);

        } catch (error: any) {
            console.error("🚨 Failed to initialize socket connection:", error.message || error);
            toast.error(getErrorMessage(error, "Failed to initialize the connection to the game server."));
        }

        return () => {
            if (socketInstance) {
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
