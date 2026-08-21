import { Game, GameModeType, GameState, GameStatusType, RoomData, RoomStatusType } from '@/types/gameTypes';
import { Socket } from 'socket.io-client';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CountdownData{
    roomId:string;
    countdown: number;
}

interface GameDataState {
    room: RoomData | null;
    countdown: CountdownData | null;
    gameMode: GameModeType;
    isLobbyOpen: boolean; 
    isTimeoutRun: boolean; 
    roomStatus: RoomStatusType | GameStatusType;
    gameStatus: GameState,
    
    setIsLobbyOpen: (open: boolean) => void;
    setGameMode: (mode: GameModeType) => void;
    setGameStatus: (status: GameState) => void;
    setRoomStatus: (status: RoomStatusType | GameStatusType) =>void;
    openRoomListener: (socket: Socket | null) => void;
    clearGameData: () => void;
    clearStatus: () => void;
    setTimeoutRun: (run: boolean) => void;
}

export const useRoomDataBySocket = create<GameDataState>()(
    devtools((set, get) => ({
        room: null,
        countdown: null,
        gameMode: null,
        isLobbyOpen: false,
        isTimeoutRun: false,
        roomStatus: null,
        gameStatus: null,

        setIsLobbyOpen: (open) => set({ isLobbyOpen: open }),
        setGameMode: (mode) => set({ gameMode: mode }),
        setTimeoutRun: (run) => set({ isTimeoutRun: run }),
        setRoomStatus: (status) => set({ roomStatus: status }),
        setGameStatus: (status) => set({ gameStatus: status }),

        openRoomListener: (socket) => {
            if (!socket) {
                get().clearGameData();
               return; 
            };

            socket.off('countdown');
            socket.off('room-update');
            socket.off('game-state');

            socket.on('game-state', (data: Game) => {
                get().setRoomStatus(data.status);

                if (data.status === 'finished')
                    get().clearGameData();
            });

            socket.on('room-update', (data: RoomData) => {
                get().setRoomStatus(data.roomStatus);

                console.log("room-update: ", data);
                if (data.roomStatus === 'ABANDONED') {
                    set({isLobbyOpen: false});
                    get().clearGameData();
                    return;
                }

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
            isLobbyOpen: false,
            isTimeoutRun: false,
        }),

        clearStatus: () => set({roomStatus: null, gameStatus: null,})
    }),
    {
        name: "RoomDataState",
    }
));
