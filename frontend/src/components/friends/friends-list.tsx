'use client'

import { useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { UserRoundX } from 'lucide-react';
import DialogModal from '../modal/dialog-modal';
import { OnlineStateItem } from '@/ui/online-tracker';
import { useGameSocket } from '@/providers/SocketProvider';
import style  from "./friends.module.css"

interface Friend {
  id: number;
  name: string;
  avatar?: string | null;
  isOnline: boolean;
  score: number;
}

interface FriendCardProps {
    friend: Friend;
    filter: ActiveFilterType;
    removeFriend: (friend: Friend) => void;
    handleGameAction: (action: string) => void;
}

interface ListOfFriendsProps {
    friends: Friend[];
    filter: ActiveFilterType;
    removeFriend: (friend: Friend) => void;
    handleGameAction: (action: string) => void;
}

type ActiveFilterType = 'All' | 'Online' | 'Playing';


interface FriendsContentProps {
    friends: Friend[];
    filter: ActiveFilterType;
    removeFriendCard: (id: number)=> void
}

const rowActionBtn =
    "flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border-default px-2 py-1 text-xs font-medium text-text-secondary transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40";

function FriendCard({friend, filter, removeFriend, handleGameAction}: FriendCardProps) {
    const {name, avatar, isOnline, score} = friend;
    const av = name && typeof name === "string" ? name.slice(0, 2) : "";
    const isAvatar =  !!avatar;

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
                    <span>In public match · Room 47 · 3rd of 8</span>
                    <span className="text-text-disabled">·</span>
                    <span className="font-medium text-text-primary">{score}</span>
                    {/* <span className="text-xs text-success">▲42 wk</span> */}
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
                    filter === 'Online' &&
                        <button
                            className={`${rowActionBtn} py-[5px] hover:border-accent hover:text-accent-hover active:text-accent-active`}
                            onClick={() => handleGameAction("invite")}
                        >
                            invite
                        </button>
                }

               {
                    filter === 'Playing' &&
                        <button
                            className={`${rowActionBtn} py-[5px] hover:border-accent hover:text-accent-hover active:text-accent-active`}
                            onClick={() => handleGameAction("join")}
                        >
                            join
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
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [user, setUser] = useState<Friend | null>(null);
    const {socket, isConnected} = useGameSocket();
    let newFriends: Friend[] = [];

    if (filter === 'All') {
        newFriends = friends;
    } else if (filter === 'Online') {
        newFriends  = friends.filter(it => it.isOnline);
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

    const handleGameAction = (action: string) => {
        console.log(action);
        if (!socket || !isConnected) return;

        if (action === "invite") {
            socket.emit("invite-playing");
        } else if (action === "join") {
            socket.emit("join-playing");
        }
    }

    if (newFriends.length === 0 && filter === 'All')
        return  (
            <div className="flex min-w-0 flex-col gap-2.5">
                <p className="text-sm text-warning-text">No friends yet</p>
            </div>)

    if (newFriends.length === 0 && filter === 'Online')
        return  (
            <div className="flex min-w-0 flex-col gap-2.5">
                <p className="text-sm text-warning-text">No friends online</p>
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
            title={`Remove ${user?.name} from friends?`}
            warning="They'll no longer see your status or invite you to matches. You can add them back anytime."
            secondBtn="Remove friend"
            handleConfirmation={handleConfirmationRequest}
        >
            <UserRoundX className="w-4 h-4" />
        </DialogModal>
        </div>
    )
}

export default FriendsContent;
