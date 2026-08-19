import { GameModeType, Snake } from '@/types/gameTypes';
import { create } from 'zustand'

interface PlayerStoreState {
    players: Snake[];
    setPlayers: (OnlineUsers: Snake[]) => void;
    addPlayers: (user: Snake) => void;
    updatePlayers: (id: number, data: Partial<Omit<Snake, 'id'>>) => void;
    resetPlayers: () => void;
}

interface GameMode {
    gameMode: GameModeType;
    setGameMode: (mode: GameModeType) => void;
    resetMode: () => void;
}

interface IdState {
    friendId: number;
    roomId: string;
    setFriendId: (id: number) => void;
    setRoomId: (id: string) => void;
    resetIds: () => void;
}

export const  usePlayerStore = create<PlayerStoreState>((set) => ({
    players: [],
    
    setPlayers: (players) => {
        set({
            players,
        })
    },

    addPlayers : (user) => set((state) => ({
        players : [...state.players, user],
    })),

    updatePlayers: (id, data) => 
        set((state) => ({
            players : state.players.map((user) => 
                user.id === id ? { ...user, ...data} 
            : user)
        })),
    
    resetPlayers: () => {set(() => ({players: []}))}
}));

export const  useGameMode = create<GameMode>((set) => ({
    gameMode: null,

    setGameMode: (mode) => { set(() => ({ gameMode: mode }))},
    resetMode: () => {set(() => ({gameMode: null}))}
}));

export const  useFriendAndRoomID = create<IdState>((set) => ({
    friendId: 0,
    roomId: '',

    setFriendId: (id) => { set(() => ({ friendId: id }))},
    setRoomId: (id) => { set(() => ({ roomId: id })) },
    resetIds: () => { set(() => ({ friendId: 0, roomId: '' }))}
}));


