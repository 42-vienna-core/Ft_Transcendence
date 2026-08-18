'use client';

import { useRouter } from 'next/navigation';
import LobbyModal from './modal/lobby-modal';
import { useRoomDataBySocket } from './store/useRoomData';

export default function GlobalLobbyManager() {
    const router = useRouter();
    
    const { isLobbyOpen, room, gameMode, setIsLobbyOpen, clearGameData } = useRoomDataBySocket();

    const handleStartMatch = () => {
        setIsLobbyOpen(false);
        router.push("/arena");
        router.refresh();
    };

    const handleCloseLobby = () => {
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
