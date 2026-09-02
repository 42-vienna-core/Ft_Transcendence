import {  Friend, GameRequestData, Request, RoomStatusType } from '@/types/gameTypes';
import { SocketResponse } from '@/types/socketTypes';
import { Socket } from 'socket.io-client';
import { create } from 'zustand'
import { devtools } from 'zustand/middleware';

interface PlayingFriendRoom {
    id: string;
    status: 'WAITING' | 'READY' | 'PLAYING';
    type: 'PUBLIC' | 'PRIVATE' | 'FRIEND';
    maxUsers: number;
    waitTimeout: string | null;
    owner: Friend | null;
    roomUsers: {userId: number}[];
    _count: {
      roomUsers: number;
    };
  }

interface FrindMatchStatus{
    roomId: string;
    status: 'ABANDONED' | 'FINISHED';
}

interface NotificationState {
    gameNotification: number;
    beFriendNotification: number;
    gameRequests: GameRequestData[];
    friendRequests: Request[];
    playFriends: PlayingFriendRoom[];
    status: RoomStatusType;

    openNotificationListener: (socket: Socket) => void;
    setStatus: (status: RoomStatusType) => void;

    clearGameRequests: () => void;
    removeRequestById: (id: string) => void;
    
    clearPlayingFriends: () => void;
    removePlayingFriendById: (id: string) => void
}


export const useNotificationListener = create<NotificationState>()(
    devtools((set, get) => ({
        gameNotification: 0,
        beFriendNotification: 0,
        gameRequests: [],
        friendRequests: [],
        playFriends: [],
        status: null,

        setStatus: (status) => set({status}),

        openNotificationListener: (socket) => {
            if (!socket) return;

            socket.off('friend-match-invite');
            socket.off('friend-request-received');
            socket.off('friend-match-status');
            socket.off('playing-friends-changed');

            socket.on('friend-match-status', (data: FrindMatchStatus) => {
                get().setStatus(data.status);

                set((state) => {

                    if (data.status === 'ABANDONED' || data.status === 'FINISHED') {
                        const newState = state.gameRequests.filter((it) => it.roomId !== data.roomId);
                        get().removePlayingFriendById(data.roomId);

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
                set((state) => {
                    const updatedGameRequests = [...state.gameRequests, data];
                    return {
                        gameRequests: updatedGameRequests,
                        gameNotification: updatedGameRequests.length,
                    };
                });
            });

            socket.on('friend-request-received', (data: Request) => {

                set((state) => {
                    const updatedFriendRequests = [...state.friendRequests, data];
                    return {
                        friendRequests: updatedFriendRequests,
                        beFriendNotification: updatedFriendRequests.length
                    };
                });
            });

            socket.on('playing-friends-changed', () => {
                socket.emit('get-playing-friends', (response: SocketResponse<PlayingFriendRoom[]>) => {
                    if (!response.success)
						return;
					let data: PlayingFriendRoom[] = [];
					if (response.data !== undefined && response.data !== null)
						data = response.data;

                    const arr = get().playFriends;

                    arr.map((it) => {
                        for (const room of data) {
                            if (it.id === room.id) {
                                get().removePlayingFriendById(it.id );
                            }
                        } 
                    });
                    
                    const newPlaingFriends = [
                        ...get().playFriends, ...data.filter((it) => it.type === 'FRIEND')
                    ];

                    set({playFriends: newPlaingFriends});
                })
            });

        },

        clearGameRequests: () => set({ gameRequests: [], gameNotification: 0 }),
        
        removeRequestById: (id) => {
            const newRequests = get().friendRequests.filter((it) => it.id !== id);
            set({friendRequests: newRequests, beFriendNotification: newRequests.length });
        },

        clearPlayingFriends: () => set({ playFriends: []}),

        removePlayingFriendById: (id) => {
            set({playFriends: get().playFriends.filter((it) => it.id !== id)})
        },
    })  
)); 
