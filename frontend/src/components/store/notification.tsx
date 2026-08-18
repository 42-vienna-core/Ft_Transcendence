import { FriendRequestData, GameRequestData } from '@/types/gameTypes';
import { Socket } from 'socket.io-client';
import { create } from 'zustand'

interface NotificationState {
    notificationNumber: number;
    gameRequests: GameRequestData[];
    friendRequests: FriendRequestData[];
    openNotificationListener: (socket: Socket) => void;
    clearGameRequests: () => void;
}


export const useNotificationListener = create<NotificationState>((set) => ({
    notificationNumber: 0,
    gameRequests: [],
    friendRequests: [],

    openNotificationListener: (socket) => {
        if (!socket) return;

        socket.off('friend-match-invite');
        socket.off('friend-request-received');

        socket.on('friend-match-invite', (data: GameRequestData) => {
            console.log("REQUESTED FRIENDS: ",data);
            set((state) => {
                const updatedGameRequests = [...state.gameRequests, data];
                return {
                    gameRequests: updatedGameRequests,
                    notificationNumber: updatedGameRequests.length + state.friendRequests.length
                };
            });
        });

        socket.on('friend-request-received', (data: FriendRequestData) => {
            set((state) => {
                const updatedFriendRequests = [...state.friendRequests, data];
                return {
                    friendRequests: updatedFriendRequests,
                    notificationNumber: state.gameRequests.length + updatedFriendRequests.length
                };
            });
        });
    },

    clearGameRequests: () => set({ gameRequests: [], notificationNumber: 0 })
}));
