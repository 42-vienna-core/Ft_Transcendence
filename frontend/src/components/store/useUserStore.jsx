import { create } from 'zustand'

export const  useUserStore = create((set) => ({
    onlineUsers: 
    [
        {
            id: 0,
            username: "",
            role: "",
        }
    ],
    
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

