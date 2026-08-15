import { RoomData } from '@/types/gameTypes';
import { Socket } from 'socket.io-client';
import { create } from 'zustand';

interface CountdownData{
    roomId:string;
    countdown: number;
}

interface GameDataState {
    roomData: RoomData | null;
    countdownData: CountdownData | null;
    clearGameData: () => void;
    openRoomListener: (socket: Socket | null) => void;
}

export const useRoomDataBySocket = create<GameDataState>((set) => ({
    roomData: null,
    countdownData: null,

    openRoomListener: (socket) => {
        if (!socket) return;

        socket.off('lobby-update');
        socket.off('countdown');
        socket.off('room-update');


        socket.on("room-update", (date) => console.log("ROOM_UPDATE",date) );


        socket.on('lobby-update', (data: RoomData) => {
            console.log("UPDATING LOBBY: ", data);
            set((state) => ({
                roomData: state.roomData ? { ...state.roomData, ...data } : data
            }));
        });

        socket.on('countdown', (countdownData: CountdownData) => {
            console.log("COUNTDOWN: ", countdownData);

            set((state) => {
                if (state.roomData && state.roomData.roomId !== countdownData.roomId)
                    return { countdownData: null };
                return {
                    countdownData: state.countdownData ? 
                    { ...state.countdownData,  ...countdownData}: 
                    countdownData
                }
            });
        });
    },

    clearGameData: () => set({ roomData: null, countdownData: null })
}));
