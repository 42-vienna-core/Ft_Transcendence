'use client'

import style from './search.module.css'
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { apiFetch } from '@/lib/api-client';
import { useProfile } from '@/providers/ProfileContext';
import { Check, Loader } from 'lucide-react';
import { OnlineStateItem } from '@/ui/online-tracker';


interface Friend {
    id: number;
    name: string;
    avatar?: string | null;
    isOnline: boolean;
    score: number;
}

interface FriendCardProps {
    friend: Friend;
    loading: boolean;
    addFriend: (id: number) => void;
}

interface FriendsListProps {
    friends: Friend[];
    message: string;
    loading: boolean;
    isSuccess: boolean;
    addFriend: (id: number) => void;
}

function FriendCard ({friend, addFriend, loading}: FriendCardProps) {
    const { id, name, avatar, isOnline, score} = friend;
    const av = (name && typeof name === 'string' )? name.slice(0,2): "";
    const isAvatar = !!avatar;

    return (
        <li className={style.sugRow}>
            <div>
                { isAvatar ? (
                    <img  className={style.av} src={avatar ? avatar : ""} alt="avatar" />
                ) : (
                    <div className={`${style.av} bg-[var(--color-snake-1)] text-[var(--color-text-primary)] capitalize`}
                        style={{ color: "var(--color-info-text)" }}
                    >
                        {av}
                    </div>
                )}
            </div>

            <div>
                <p className={style.name}>{name}</p>

                <OnlineStateItem
                    isOnline={isOnline}
                />
            
            </div>           
                {            
                    loading && (
                        <Loader className="h-5 w-5 animate-spin text-center text-accent" />
                    )
                }

                {
                    !loading && (
                        <button 
                            className={`text-info transition-colors duration-200 hover:text-accent`}
                            onClick={() => addFriend(id)}
                        >
                            + Add
                        </button>
                    )
                }
        </li>
    )
}

function FriendsList({friends, message,loading, isSuccess, addFriend}: FriendsListProps) {
    return (
        <ul >
            {friends.length > 0 &&
                (friends.map((item) => 
                    <FriendCard 
                        key={`friend-${item.id}`}
                        friend={item}
                        loading={loading}
                        addFriend={addFriend}
                    />
                ))
            }
            { message.length != 0 &&
                <li key='msg' className={`py-[5px] text-sm ${isSuccess ? "text-success": "text-warning-text"}`}>
                    {message}
                </li>
            }
        </ul>
    )
}

export default function FindFriends() {
    const userContext = useProfile();
    const [message, setMessage] = useState<string>("");
    const [result, setResult] = useState<Friend[]>([]);
    const [query, setQuery] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(true);


    const handleSearchRequest = useDebouncedCallback(async (value: string) => {
        if (value.trim().length < 3) {
            setResult([]);
            setMessage("");
            setIsSuccess(false);
            return
        }

        try {
            const res = await apiFetch(`user/search?name=${value}`);
            console.log("RES: ",res);

            if (Array.isArray(res) && res.length != 0) {
                setResult(res);
                setMessage("");
                setIsSuccess(false);
                return;
            }

            setResult([]);
            setMessage("User not found");
            
        } catch (error) {
            setResult([]);
            setMessage("Server error");
        }
    }, 300);

    async function addFriend(id: number) {
        const senderId = userContext.id;
        const receiverId = id;

        if (!senderId || !receiverId) return 

        setLoading(true);

        try {
            await apiFetch('friends/request', {
                method: 'POST',
                body: JSON.stringify({
                    senderId,
                    receiverId
                })
            });

            setIsSuccess(true);
            setMessage("The user has been added");
        } catch (error){
            setIsSuccess(false);

            if (error instanceof Error) {
                setMessage(error.message); 
            } else {
                setMessage("An unknown error occurred"); 
            }
        } finally {
            setLoading(false);
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
                loading={loading}
                isSuccess={isSuccess}
                message={message}
            />
        </div>
    )
}