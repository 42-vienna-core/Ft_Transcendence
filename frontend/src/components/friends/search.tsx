'use client'

import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { apiFetch } from '@/lib/api-client';
import { useProfile } from '@/providers/ProfileContext';
import { Loader } from 'lucide-react';
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
    const { id, name, avatar, isOnline} = friend;
    const av = (name && typeof name === 'string' )? name.slice(0,2): "";
    const isAvatar = !!avatar;

    return (
        <li className="grid grid-cols-[26px_1fr_auto] items-center gap-2 py-1.5 text-sm">
            <div>
                { isAvatar ? (
                    <img className="size-[26px] rounded-full object-cover" src={avatar ? avatar : ""} alt="avatar" />
                ) : (
                    <div className="flex size-[26px] items-center justify-center rounded-full bg-snake-1 text-xs font-medium capitalize text-info-text">
                        {av}
                    </div>
                )}
            </div>

            <div className="min-w-0">
                <p className="text-base font-medium">{name}</p>

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
                            className="cursor-pointer text-sm text-accent transition-colors duration-200 hover:text-accent-hover hover:underline"
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
        <ul>
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
                <li key='msg' className={`py-1 text-sm ${isSuccess ? "text-success": "text-warning-text"}`}>
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
        <div className="rounded-md bg-bg-subtle px-3.5 py-3">
            <h3 className="mb-2 !text-sm font-medium lowercase tracking-wide text-text-secondary">Find friends</h3>
            <div className="mb-2 flex items-center gap-2 rounded-md border border-border-default bg-bg-surface px-2.5 py-1.5 transition-colors duration-200 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-soft">
                <input
                    type="text"
                    placeholder="username"
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="w-full border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
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
