'use client'

import { useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { UserRoundX } from 'lucide-react';
import DialogModal from '../modal/dialog-modal';
import { OnlineStateItem } from '@/ui/online-tracker';
import { useGameSocket } from '@/providers/SocketProvider';
import { Friend } from '@/types/gameTypes';
import { useRoomDataBySocket } from '../store/useRoomData';
import { useNotificationListener } from '../store/notification';
import { useTranslations } from 'next-intl';
import { SocketResponse } from '@/types/socketTypes';

interface FriendCardProps {
    friend: Friend;
    filter: ActiveFilterType;
    removeFriend: (friend: Friend) => void;
    handleGameAction: (roomId: string) => void;
}

interface ListOfFriendsProps {
    friends: Friend[];
    filter: ActiveFilterType;
    removeFriend: (friend: Friend) => void;
    handleGameAction: (roomId: string) => void;
}

type ActiveFilterType = 'All' | 'Online' | 'Playing' | 'Requests';

interface FriendsContentProps {
    friends: Friend[];
    filter: ActiveFilterType;
    removeFriendCard: (id: number)=> void
}

const rowActionBtn =
    "flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border-default px-2 py-1 text-xs font-medium  transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40";

function FriendCard({friend, filter, removeFriend, handleGameAction}: FriendCardProps) {
    const { gameNotification, gameRequests, playFriends, status} = useNotificationListener();
    const LN_L = useTranslations("friends.request")
    const LN_C = useTranslations("friends.lists")
    const {id, name, avatar, isOnline, score} = friend;
    const av = name && typeof name === "string" ? name.slice(0, 2) : "";
    const isAvatar =  !!avatar;

    const filtredInviter = gameRequests?.filter((it) => it.inviter.id === id); 
    const isHost = filtredInviter && filtredInviter.length > 0;
    const roomId = isHost ? filtredInviter[0].roomId : "";

    const playingRoom = playFriends.find(room => room.roomUsers.some(user => user.userId === id));
    const isPlaying = !!playingRoom && status === 'PLAYING';
    const isShowBtn = filter === 'Online' && isHost && status !== 'PLAYING' && status !== 'READY';

    return (
        <li className="grid grid-cols-[26px_1fr_auto] items-start gap-4 rounded-md border border-border-default bg-bg-surface p-2.5 transition-colors duration-150 hover:border-border-strong">
            <div>
                { isAvatar ? (
                    <img className="size-8 shrink-0 rounded-full object-cover" src={avatar ? avatar : ""} alt="avatar" />
                ) : (
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-snake-1 text-sm font-medium capitalize text-info-text">
                        {av}
                    </div>
                )}
            </div>

            <div className="min-w-0 pt-px">
                <div className="flex min-w-0 items-center gap-1.5">
                    <span className="text-sm font-medium">{name}</span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-sm text-text-secondary">
                    <OnlineStateItem
                        isOnline={isOnline}
                    />
                    { isPlaying && <span>{LN_C("inMatch")} {`· ${LN_C("room")} ${playingRoom?.id.slice(0, 8)}`} </span>}
                    <span className="text-text-disabled">·</span>
                    <span className="font-medium text-text-primary">{LN_C("score")} {score}</span>
                </div>
            </div>
            <div className="ml-auto flex min-w-[76px] flex-col items-stretch gap-1">
                {
                    filter === 'All' &&
                        <button
                            className={`${rowActionBtn} hover:border-danger hover:text-danger active:text-danger-hover`}
                            onClick={() => removeFriend(friend)}
                        >
                            <UserRoundX className="h-4 w-4" />
                        </button>
                }

                {
                    isShowBtn &&
                        <button
                            className={`${rowActionBtn} py-[5px] hover:border-accent text-text-inverse active:text-accent-active
                            ${gameNotification && 'animate-btn-blink '}
                            `}
                            onClick={() => handleGameAction(roomId)}
                        >
                            {LN_L("join")}
                        </button>
                }
            </div>
        </li>
    )
}

function ListOfFriends({friends, filter, removeFriend, handleGameAction}: ListOfFriendsProps ) {
    return (
        <ul className="flex flex-col gap-2">
            {friends.length > 0 &&
                (friends.map(friend =>
                    <FriendCard
                        key={`friend-${friend.id}`}
                        filter={filter}
                        friend={friend}
                        removeFriend={removeFriend}
                        handleGameAction={handleGameAction}
                    />
                ))
            }
        </ul>
    )
}

function FriendsContent ({friends, filter, removeFriendCard}: FriendsContentProps) {
    const [ isOpen, setIsOpen ] = useState<boolean>(false);
    const [ user, setUser ] = useState<Friend | null>(null);
    const { socket, isConnected } = useGameSocket();
    const { setIsLobbyOpen, setGameMode, clearStatus, clearGameData} = useRoomDataBySocket();
    const { playFriends, status} = useNotificationListener();
    const LN_L = useTranslations("friends.lists");
    const LN_D = useTranslations("friends.dialog");


    let newFriends: Friend[] = [];

    if (filter === 'All') {
        newFriends = friends;
    } else if (filter === 'Online') {
        newFriends = friends.filter(it => it.isOnline);
    } else if (filter === 'Playing' && status === 'PLAYING') {
        const playingIds = new Set(playFriends.flatMap(room => room.roomUsers.map(user => user.userId)));
        newFriends = friends.filter(it => playingIds.has(it.id));
    }

    async function handeleFriendRemoving(friend: Friend) {
        setUser(friend);
        setIsOpen(true);
    }

    const handleConfirmationRequest = async (confirm: boolean) => {
        setIsOpen(false);

        if (!confirm) {
            return ;
        }

        try {
            const url = `friends/${user?.id}`
            await apiFetch(url, {method: 'DELETE'});

            removeFriendCard(user?.id? user?.id: 0);
        } catch (error) {
            console.log("ERROR deleting a friend: ", error);
        }
    }

    const handleGameAction = async (roomId: string) => {
        if (!socket || !isConnected) return;

        clearStatus();

        //socket.emit('join-match', {mode: 'FRIENDS_JOIN', roomId});
		socket.timeout(10000).emit('join-match', {mode: 'FRIENDS_JOIN', roomId},(timeoutError: Error | null, response?: SocketResponse<unknown>) => {
			if (timeoutError || !response?.success)
				clearGameData();
		});

        setGameMode('FRIENDS_JOIN');
        setIsLobbyOpen(true);
    }

    if (filter === 'Requests') return null;

    if (newFriends.length === 0 && filter === 'All')
        return  (
            <div className="flex min-w-0 flex-col gap-2.5">
                <p className="text-sm text-warning-text"> {LN_L("noFriends")}</p>
            </div>)

    if (newFriends.length === 0 && filter === 'Online')
        return  (
            <div className="flex min-w-0 flex-col gap-2.5">
                <p className="text-sm text-warning-text">{LN_L("noOnline")}</p>
            </div>)
    
    if (newFriends.length === 0 && filter === 'Playing')
        return  (
            <div className="flex min-w-0 flex-col gap-2.5">
                <p className="text-sm text-warning-text">{LN_L("noPlaying")}</p>
            </div>)

    return (
        <div className="flex min-w-0 flex-col gap-2.5">
            <ListOfFriends
                filter={filter}
                friends={newFriends}
                removeFriend={handeleFriendRemoving}
                handleGameAction={handleGameAction}
            />
            <DialogModal
                isOpen={isOpen}
                type={'REMOVE_FRIEND'}
                title={`${LN_D("title")}  ${user?.name}  ${LN_D("title+")}`}
                warning={LN_D("warning")}
                secondBtn={LN_D("secondBtn")}
                handleConfirmation={handleConfirmationRequest}
            >
                <UserRoundX className="w-4 h-4" />
            </DialogModal>
        </div>
    )
}

export default FriendsContent;
