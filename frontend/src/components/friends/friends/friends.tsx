'use client'

import { useEffect, useState } from 'react';
import style from './friends.module.css'
import { apiFetch } from '@/lib/api-client';
import { UserRoundX } from 'lucide-react';
import DialogModal from '../../modal/dialog-modal';

interface Friend {
  id: number;
  name: string;
  avatar?: string | null;
  isOnline: boolean;
  score: number;
}

interface FriendCardProps {
    friend: Friend;
    removeFriend: (friend: Friend) => void;

}

interface ListOfFriendsProps {
    friends: Friend[];
    filter: ActiveFilterType;
    removeFriend: (friend: Friend) => void;
}

type ActiveFilterType = 'All' | 'Online' | 'Playing';


interface FriendsContentProps {
    friends: Friend[];
    filter: ActiveFilterType;
    removeFriendCard: (id: number)=> void
}

function FriendCard({friend, removeFriend}: FriendCardProps) {
    const {id, name, avatar} = friend;
    const av = name && typeof name === "string" ? name.slice(0, 2) : "";

    return (
        <li className={`${style.fRow}`}>
            <div>
                { avatar ? (
                    <img src={avatar ? avatar : ""} alt="avatar" />
                ) : (
                    <div className={`${style.av} bg-[var(--color-snake-1)] text-[var(--color-text-primary)] capitalize`}
                        style={{ color: "var(--color-info-text)" }}
                    >
                        {av}
                    </div>
                )}
            </div>
            
            <div className={style.main}>
                <div className={style.who}>
                    <span className={style.nm}>{name}</span>
                </div>
                <div className={style.statusLine}>
                    <span className={`${style.dot} ${style.match}`}></span>
                    <span>In public match · Room 47 · 3rd of 8</span>
                    <span className={style.sep}>·</span>
                    <span className={style.rating}>1920</span>
                    <span className={`${style.delta} ${style.up}`}>▲42 wk</span>
                </div>
            </div>
            <button 
                className="flex items-center  px-2 py-1 bg-[var(--color-bg-muted)] text-red-600 rounded-full hover:bg-[var(--color-warning)] transition-colors"
                onClick={() => removeFriend(friend)}    
            >
                <UserRoundX className="w-4 h-4" />
            </button>
        </li>
    )
}

function ListOfFriends({friends, filter, removeFriend}: ListOfFriendsProps ) {
    return (
        <ul className="flex flex-col gap-2">
            {friends.length > 0 &&
                (friends.map(friend => 
                    <FriendCard
                        key={`friend-${friend.id}`}
                        friend={friend}
                        removeFriend={removeFriend}    
                    />
                ))
            }
        </ul>
    )
}

function FriendsContent ({friends, filter, removeFriendCard}: FriendsContentProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [user, setUser] = useState<Friend | null>(null);
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
            // await new Promise((resolve) => setTimeout(resolve, 4000));

            const url = `friends/${user?.id}`
            await apiFetch(url, {method: 'DELETE'});

            removeFriendCard(user?.id? user?.id: 0);
        } catch (error) {
            console.log("ERROR deleting a friend: ", error);
        }
    }

    if (newFriends.length === 0 && filter === 'All') 
        return  (
            <div className={style.col}>
                <p className="text-[15px] text-[var(--color-warning)]">No friends yet</p>
            </div>)
    
    if (newFriends.length === 0 && filter === 'Online') 
        return  (
            <div className={style.col}>
                <p className="text-[15px] text-[var(--color-warning)]">No friends online</p>
            </div>)

    return (
        <div className={style.col}>
            <ListOfFriends 
                friends={newFriends}
                filter={filter}
                removeFriend={handeleFriendRemoving}
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