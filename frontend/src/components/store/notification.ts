import { FriendRequestData, GameRequestData } from '@/types/gameTypes';
import { Socket } from 'socket.io-client';
import { create } from 'zustand'

interface FrindMatchStatus{
    roomId: string;
    status: 'ABANDONED' | 'FINISHED';
}

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
        socket.off('friend-match-status');
        
        socket.on('friend-match-status', (data: FrindMatchStatus) => {
            console.log("friend-match-status", data);
            set((state) => {

                if (data.status === 'ABANDONED' || data.status === 'FINISHED') {
                    console.log("oldState: ",state.gameRequests);

                    const newState = state.gameRequests.filter((it) => it.roomId !== data.roomId);
                    console.log("newState: ",newState);
                    
                    return {
                        gameRequests: newState,
                        notificationNumber: newState.length
                    }
                } else {
                    return {
                        gameRequests: state.gameRequests,
                        notificationNumber: state.gameRequests.length
                    };
                }
            })
        });

        socket.on('friend-match-invite', (data: GameRequestData) => {
            console.log("friend-match-invite: ",data);
            set((state) => {
                const updatedGameRequests = [...state.gameRequests, data];
                return {
                    gameRequests: updatedGameRequests,
                    notificationNumber: updatedGameRequests.length + state.friendRequests.length
                };
            });
        });

        socket.on('friend-request-received', (data: FriendRequestData) => {
            console.log("friend-request-received: ", data);

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
