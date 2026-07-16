import { create } from 'zustand'

interface OnlineUser {
    id: number,
    username: string,
    role: string,
}

interface UserStoreState {
    onlineUsers: OnlineUser[];
    setOnlineUsers: (OnlineUsers: OnlineUser[]) => void;
    addOnlineUser: (user: OnlineUser) => void;
    updateUser: (id: number, data: Partial<Omit<OnlineUser, 'id'>>) => void;
}

export const  useUserStore = create<UserStoreState>((set) => ({
    onlineUsers: [],
    
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

