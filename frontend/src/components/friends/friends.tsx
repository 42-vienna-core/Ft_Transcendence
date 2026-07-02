'use client'

import { useEffect, useState } from 'react';
import style from './friends.module.css'
import { apiFetch } from '@/lib/api-client';
import { UserRoundX } from 'lucide-react';

interface Friend {
  id: number;
  name: string;
  avatar?: string | null;
}

interface FriendCardProps {
    friend: Friend;
    removeFriend: (id: number) => void;

}

interface ListOfFriendsProps {
    friends: Friend[];
    removeFriend: (id: number) => void;
}

function FriendCard({friend, removeFriend}: FriendCardProps) {
    const {id, name, avatar} = friend;
    const av = name && typeof name === "string" ? name.slice(0, 2) : "";

    return (
        <li key={id} className={`${style.fRow}`}>
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
                onClick={() => removeFriend(id)}    
                
            >
                
                <UserRoundX className="w-4 h-4" />
            </button>
        </li>
    )
}

function ListOfFriends({friends, removeFriend}: ListOfFriendsProps ) {
    console.log("friends: ",friends);
    return (
        <ul className="flex flex-col gap-2">
            {friends.length > 0 &&
                (friends.map(friend => 
                    <FriendCard 
                        friend={friend}
                        removeFriend={removeFriend}    
                    />
                ))
            }
        </ul>
    )
}

export default function FriendsList () {
    const [result, setResult] = useState<Friend[]>([]);

    useEffect(() => {
        const getListOfFriends = async () =>
        {
            try {
                const res = await apiFetch('friends');

                if (Array.isArray(res) && res.length != 0) {
                    setResult(res);
                    console.log("FRIENDS LIST", res);
                    return;
                }
                
                setResult([]);
            } catch (error) {
                console.log("ERROR getting friends: ", error);
            }
        }

        getListOfFriends();
    }, []);

    async function handeleFriendRemoving(id: number) {
        if (id === 0) return;

        try {
            const url = `friends/${id}`
            await apiFetch(url, {method: 'DELETE'});

            setResult(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.log("ERROR deleting a friend: ", error);
        }
    }

    return (
        <div className={style.col}>
            <ListOfFriends 
            friends={result}
            removeFriend={handeleFriendRemoving}
        />
            {/* { result.length === 0 &&(
                <p className="text-[var(--color-warning-text)] ">"No friends yet"</p>
            )} */}
        </div>
    )
}