import { GameModeType, RoomData, RoomStatusType } from '@/types/gameTypes';
import { Socket } from 'socket.io-client';
import { create } from 'zustand';

interface CountdownData{
    roomId:string;
    countdown: number;
}

interface GameDataState {
    room: RoomData | null;
    countdown: CountdownData | null;
    gameMode: GameModeType | null;
    isLobbyOpen: boolean; 
    
    setIsLobbyOpen: (open: boolean) => void;
    setGameMode: (mode: GameModeType | null) => void;
    openRoomListener: (socket: Socket | null) => void;
    clearGameData: () => void;
}

export const useRoomDataBySocket = create<GameDataState>((set) => ({
    room: null,
    countdown: null,
    gameMode: null,
    isLobbyOpen: false,

    setIsLobbyOpen: (open) => set({ isLobbyOpen: open }),
    setGameMode: (mode) => set({ gameMode: mode }),

    openRoomListener: (socket) => {
        if (!socket) return;

        socket.off('countdown');
        socket.off('room-update');

        socket.on('room-update', (data: RoomData) => {
            console.log("room-update: ", data);
            set((state) => ({
                room: state.room ? { ...state.room, ...data } : data,
            }));
        });

        socket.on('countdown', (countdown: CountdownData) => {
            console.log("COUNTDOWN: ", countdown);

            set((state) => {
                if (state.room && state.room.roomId !== countdown.roomId)
                    return { countdown: null };
                return {
                    countdown: state.countdown ? 
                    { ...state.countdown,  ...countdown } :
                    countdown
                }
            });
        });
    },

    clearGameData: () => set({ 
        room: null, 
        countdown: null, 
        gameMode: null,
        isLobbyOpen: false
    })
}));
