import { State } from 'pixi.js';
import { create } from 'zustand'

type GameModeType = 'QUICK' | 'FRIEND' | 'CPU' | null;

interface OnlineUser {
    id: number,
    username: string,
    role: string,
}

interface UserStoreState {
    onlineUsers: OnlineUser[];
    gameMode: GameModeType;
    setOnlineUsers: (OnlineUsers: OnlineUser[]) => void;
    addOnlineUser: (user: OnlineUser) => void;
    updateUser: (id: number, data: Partial<Omit<OnlineUser, 'id'>>) => void;
}

interface GameMode {
    gameMode: GameModeType;
    setGameMode: (mode: GameModeType) => void;
    resetMode: () => void;
}

export const  useUserStore = create<UserStoreState>((set) => ({
    onlineUsers: [],
    gameMode: null,
    
    setOnlineUsers: (onlineUsers) => {
        set({
            onlineUsers,
        })
    },

    addOnlineUser : (user) => set((state) => ({
        onlineUsers : [...state.onlineUsers, user],
    })),

    updateUser: (id, data) => 
        set((state) => ({
            onlineUsers : state.onlineUsers.map((user) => 
                user.id === id ? { ...user, ...data} 
            : user)
        })),

}));

export const  useGameMode = create<GameMode>((set) => ({
    gameMode: null,

    setGameMode: (mode) => {
        set((state) => ({
            gameMode: mode
        }))
    },

    resetMode: () => {set(() => ({gameMode: null}))}
}));

