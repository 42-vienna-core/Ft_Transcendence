'use client';

import { useRouter } from 'next/navigation';
import LobbyModal from './modal/lobby-modal';
import { useRoomDataBySocket } from './store/useRoomData';
import { useGameSocket } from '@/providers/SocketProvider';
import { useAudioStore } from './store/useAudioStore';
import { SocketResponse } from '@/types/socketTypes';

export default function GlobalLobbyManager() {
    const router = useRouter();
    const {socket} = useGameSocket();
    const { isLobbyOpen, room, gameMode, clearGameData, roomStatus} = useRoomDataBySocket();

    console.log("LOBY status ====> ", roomStatus);

    const handleStartMatch = () => {
        if (!roomStatus) return ;
        
        router.push("/arena");
        router.refresh();
    };
	//I dont need you to send me roomId anymore, so i commented it out here, 
	// but you schould chekc if it needs to be removed somewhere else when you call this function
    const handleCloseLobby = (/* roomId: string */) => {
        if (!socket /* || !roomId */) return;

        console.log("emit('leave-room");
        socket.timeout(5000).emit('leave-room', (timeoutError: Error | null, response?: SocketResponse) => {
			if (timeoutError || !response?.success)
				return;
			clearGameData();
		});
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
