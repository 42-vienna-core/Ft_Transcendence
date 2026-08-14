import { RoomData } from '@/types/gameTypes';
import { Socket } from 'socket.io-client';
import { create } from 'zustand';

interface GameDataState {
    roomData: RoomData | null;
    countdown: number;
    clearGameData: () => void;
    openRoomListener: (socket: Socket | null) => void;
}

export const useRoomDataBySocket = create<GameDataState>((set) => ({
    roomData: null,
    countdown: 0,

    openRoomListener: (socket) => {
        if (!socket) return;

        socket.off('lobby-update');
        socket.off('countdown');

        socket.on('lobby-update', (data: RoomData) => {
            console.log("UPDATING LOBBY: ", data);
            set((state) => ({
                roomData: state.roomData ? { ...state.roomData, ...data } : data
            }));
        });

        socket.on('countdown', (countdown: number) => {
            set(() => ({ countdown }));
        });
    },

    clearGameData: () => set({ roomData: null, countdown: 0 })
}));
