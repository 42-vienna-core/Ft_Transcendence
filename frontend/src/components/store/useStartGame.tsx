import { create } from 'zustand';
import { Socket } from 'socket.io-client';
import { GameModeType } from '@/types/gameTypes';

interface GameDataState {
    gameMode: GameModeType | null;
    isLoading: boolean;
    isLobbyOpen: boolean;
    
    setLoading: (loading: boolean) => void;
    setIsLobbyOpen: (open: boolean) => void;
    
    handleRoomLobby: (mode: GameModeType, socket: Socket | null, pushRoute: (url: string) => void) => void;
    handleStartMatch: (pushRoute: (url: string) => void) => void;
}

export const useStartGame = create<GameDataState>((set, get) => ({
    gameMode: null,
    isLoading: false,
    isLobbyOpen: false,

    setLoading: (isLoading) => set({ isLoading }),
    setIsLobbyOpen: (isLobbyOpen) => set({ isLobbyOpen }),

    handleRoomLobby: (mode, socket, pushRoute) => {
        if (!socket) return;
        
        set({ isLoading: true, gameMode: mode });
        console.log("MODE: ", mode);

        socket.emit('join-match', { mode });

        if (mode === 'CPU') {
            pushRoute("/arena");
            return;
        }

        set({ isLobbyOpen: true, isLoading: false });
    },

    handleStartMatch: (pushRoute) => {
        console.log("Start match");
        pushRoute("/arena");
    }
}));
