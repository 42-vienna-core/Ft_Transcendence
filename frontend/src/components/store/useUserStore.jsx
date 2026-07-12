import { create } from 'zustand'

export const  useUserStore = create((set) => ({
    onlineUsers: 
    [
        {
            id: 0,
            Username: "",
            role: "",
            history: {
                gamesLost: 0,
                gamesWon: 0,
                totalScore: 0,
            }
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

