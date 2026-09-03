'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import LobbyModal from './modal/lobby-modal';
import { useRoomDataBySocket } from './store/useRoomData';
import { useGameSocket } from '@/providers/SocketProvider';
import { SocketResponse } from '@/types/socketTypes';

export default function GlobalLobbyManager() {
    const router = useRouter();
    const locale = useLocale();
    const {socket} = useGameSocket();
    const { isLobbyOpen, room, gameMode, clearGameData, roomStatus} = useRoomDataBySocket();

    const handleStartMatch = () => {
        if (!roomStatus) return ;

        router.push(`/${locale}/arena`);
        router.refresh();
    };

    const handleCloseLobby = () => {
        if (!socket) return;

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
