'use client';

import { useRouter } from 'next/navigation';
import LobbyModal from './modal/lobby-modal';
import { useRoomDataBySocket } from './store/useRoomData';
import { useGameSocket } from '@/providers/SocketProvider';

export default function GlobalLobbyManager() {
    const router = useRouter();
    const {socket} = useGameSocket();
    
    const { isLobbyOpen, room, gameMode, clearGameData } = useRoomDataBySocket();

    const handleStartMatch = () => {
        router.push("/arena");
        router.refresh();
    };

    const handleCloseLobby = (roomId: string) => {
        if (!socket || !roomId) return;

        console.log("emit('leave-room', {roomId:",roomId, "}");
        socket.emit('leave-room', {roomId});
        clearGameData();
    };

    return (
        <LobbyModal 
            isOpen={isLobbyOpen}
            room={room}
            gameMode={gameMode}
            onStartmatch={handleStartMatch}
            onClose={handleCloseLobby}
        />
    );
}
