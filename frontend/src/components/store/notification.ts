import {  GameRequestData, Request } from '@/types/gameTypes';
import { Socket } from 'socket.io-client';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware';


interface FrindMatchStatus{
    roomId: string;
    status: 'ABANDONED' | 'FINISHED';
}

interface NotificationState {
    gameNotification: number;
    beFriendNotification: number;
    gameRequests: GameRequestData[];
    friendRequests: Request[];
    openNotificationListener: (socket: Socket) => void;
    clearGameRequests: () => void;
    removeRequestById: (id: string) => void;
}


export const useNotificationListener = create<NotificationState>()(
    devtools((set, get) => ({
        gameNotification: 0,
        beFriendNotification: 0,
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
                            gameNotification: newState.length
                        }
                    } else {
                        return {
                            gameRequests: state.gameRequests,
                            gameNotification: state.gameRequests.length
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
                        gameNotification: updatedGameRequests.length,
                    };
                });
            });

            socket.on('friend-request-received', (data: Request) => {
                console.log("friend-request-received: ", data);

                set((state) => {
                    const updatedFriendRequests = [...state.friendRequests, data];
                    return {
                        friendRequests: updatedFriendRequests,
                        beFriendNotification: updatedFriendRequests.length
                    };
                });
            });
        },

        clearGameRequests: () => set({ gameRequests: [], gameNotification: 0 }),
        
        removeRequestById: (id) => {
            const newRequests = get().friendRequests.filter((it) => it.id !== id);
            set({friendRequests: newRequests, beFriendNotification: newRequests.length });
        }
    })  
)); 
