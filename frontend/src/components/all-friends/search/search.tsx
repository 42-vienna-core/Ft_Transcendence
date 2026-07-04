'use client'

import style from './search.module.css'
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { apiFetch } from '@/lib/api-client';
import { useProfile } from '@/providers/ProfileContext';

interface FriendCardProps {
    id: number
    name: string;
    avatar?: string | null;
    addFriend: (id: number) => void;
}

interface Friend {
  id: number;
  name: string;
  avatar?: string | null;
}

interface FriendsListProps {
    friends: Friend[];
    errorMessage: string;
    addFriend: (id: number) => void;
}

function FriendCard ({id, name, avatar, addFriend}: FriendCardProps) {
    const av = (name && typeof name === 'string' )? name.slice(0,2): "";

    return (
        <li className={style.sugRow}>
            <div
                className={`${style.av} bg-[var(--color-snake-1)] text-[var(--color-text-primary)] capitalize`}
                style={{ color: "var(--color-info-text)" }}
            >
                {av}
            </div>
                <div>
                    <p className={style.name}>{name}</p>
                    <p className={style.metaR}>5 mutual friends</p>
                </div>
            <button 
                className={style.addMini}
                onClick={() => addFriend(id)}
            >
                + Add
            </button>
        </li>
    )
}

function FriendsList({friends, errorMessage, addFriend}: FriendsListProps) {
    return (
        <ul >
            {friends.length > 0 &&
                (friends.map(({id, name, avatar}) => 
                    <FriendCard 
                        key={`friend-${id}`}
                        id={id}
                        name={name} 
                        addFriend={addFriend}
                    />
                ))
            }
            { errorMessage.length != 0 &&
                <li key='error-msg' className="py-[5px] text-sm text-[var(--color-warning-text)]">
                    {errorMessage}
                </li>
            }
              
            <li className={style.sugLabel}>suggested</li>
            <FriendCard 
                id={45}
                name={"dmitriy"}
                addFriend={addFriend}
            />
            <FriendCard
                id={35} 
                name={"pickle"}
                addFriend={addFriend}
            />
        </ul>
    )
}

export default function FindFriends() {
    const userContext = useProfile();
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [result, setResult] = useState<Friend[]>([]);
    const [query, setQuery] = useState<string>("");

    const handleSearchRequest = useDebouncedCallback(async (value: string) => {
        if (value.trim().length < 3) {
            setResult([]);
            setErrorMessage("");
            return
        }

        try {
            const res = await apiFetch(`user/search?name=${value}`);
            console.log("RES: ",res);

            if (Array.isArray(res) && res.length != 0) {
                console.log(res);
                setResult(res);
                setErrorMessage("")
                return 
            }

            setResult([]);
            setErrorMessage("User not found")
            
        } catch (error) {
            console.log("ERROR: ", error);
            setResult([]);
            setErrorMessage("Server error")
        }
    }, 300);

    async function addFriend(id: number) {
        const senderId = userContext.id;
        const receiverId = id;

        if (!senderId || !receiverId) return 

        try {
            const res = await apiFetch('friends/request', {
                method: 'POST',
                body: JSON.stringify({
                    senderId,
                    receiverId
                })
            });

            if (res.success)
                console.log("SUCCESS");
        } catch (error) {
            console.log("ERROR: ",error);
        }
    }


    function handleInputChange(value: string) {
        setQuery(value)
        handleSearchRequest(value);
    }

    return (
        <div className={style.card}>
            <h3>Find friends</h3>
            <div className={style.searchInput}>
                <label className={`${style.ti} ${style.tiSearch}`} aria-hidden="true"></label>
                <input
                    type="text"
                    placeholder="username or invite code"
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                />
               
            </div>
            <FriendsList
                friends={result}
                addFriend={addFriend}
                errorMessage={errorMessage}
            />
        </div>
    )
}