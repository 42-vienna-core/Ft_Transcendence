'use client'

import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { apiFetch } from '@/lib/api-client';
import { useProfile } from '@/providers/ProfileContext';
import { Loader, Search, X } from 'lucide-react';
import { OnlineStateItem } from '@/ui/online-tracker';
import { useTranslations } from 'next-intl';

interface Friend {
    id: number;
    name: string;
    avatar?: string | null;
    isOnline: boolean;
    score: number;
}

interface FriendCardProps {
    friend: Friend;
    addFriend: (id: number) => Promise<boolean>;
}

interface FriendsListProps {
    friends: Friend[];
    message: string;
    isSuccess: boolean;
    addFriend: (id: number) => Promise<boolean>;
}

type AddStatus = 'idle' | 'loading' | 'done';

function FriendCard({ friend, addFriend }: FriendCardProps) {
    const [status, setStatus] = useState<AddStatus>('idle');
    const LN = useTranslations("friends.lists");
    const { id, name, avatar, isOnline } = friend;
    const av = (name && typeof name === 'string') ? name.slice(0, 2) : "";
    const isAvatar = !!avatar;

    async function handleOnClick() {
        if (status !== 'idle') return;

        setStatus('loading');
        const success = await addFriend(id);
        setStatus(success ? 'done' : 'idle');
    }

    return (
        <li className="grid grid-cols-[26px_1fr_auto] items-center gap-2 py-1.5 text-sm">
            <div>
                {isAvatar ? (
                    <img className="size-[26px] shrink-0 rounded-full object-cover" src={avatar ? avatar : ""} alt="avatar" />
                ) : (
                    <div className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-snake-1 text-xs font-medium capitalize text-info-text">
                        {av}
                    </div>
                )}
            </div>

            <div className="min-w-0">
                <p className="truncate text-base font-medium">{name}</p>

                <OnlineStateItem
                    isOnline={isOnline}
                />

            </div>

            {status === 'loading' && (
                <Loader className="h-5 w-5 animate-spin text-center text-accent" />
            )}

            {status === 'idle' && (
                <button
                    type="button"
                    className="cursor-pointer whitespace-nowrap text-sm text-accent transition-colors duration-200 hover:text-accent-hover hover:underline"
                    onClick={handleOnClick}
                >
                    + {LN("add")}
                </button>
            )}

            {status === 'done' && (
                <p className="whitespace-nowrap text-sm text-text-tertiary">{LN("done")}</p>
            )}
        </li>
    )
}

function FriendsList({ friends, message, isSuccess, addFriend }: FriendsListProps) {
    return (
        <ul className="max-h-[45vh] divide-y divide-border-subtle overflow-y-auto">
            {friends.length > 0 &&
                (friends.map((item) =>
                    <FriendCard
                        key={`friend-${item.id}`}
                        friend={item}
                        addFriend={addFriend}
                    />
                ))
            }
            {message.length != 0 &&
                <li
                    key='msg'
                    className={`sticky bottom-0 border-t border-border-subtle bg-bg-subtle py-1.5 text-sm ${isSuccess ? "text-success" : "text-warning-text"}`}
                >
                    {message}
                </li>
            }
        </ul>
    )
}

export default function FindFriends({
    styles,
    handleFindModal
}: { styles: string, handleFindModal: () => void }) {
    const userContext = useProfile();
    const [message, setMessage] = useState<string>("");
    const [result, setResult] = useState<Friend[]>([]);
    const [query, setQuery] = useState<string>("");
    const [isSuccess, setIsSuccess] = useState<boolean>(true);
    const LN = useTranslations("friends.lists");


    const handleSearchRequest = useDebouncedCallback(async (value: string) => {
        if (value.trim().length < 3) {
            setResult([]);
            setMessage("");
            setIsSuccess(false);
            return
        }

        try {
            const res = await apiFetch(`user/search?name=${value}`);

            if (Array.isArray(res) && res.length != 0) {
                setResult(res);
                setMessage("");
                setIsSuccess(false);
                return;
            }

            setResult([]);
            setMessage(LN("error"));

        } catch (error) {
            setResult([]);
            setMessage(LN("serverError"));
        }
    }, 300);

    async function addFriend(id: number): Promise<boolean> {
        const senderId = userContext.id;
        const receiverId = id;

        if (!senderId || !receiverId) return false;

        try {
            await apiFetch('friends/request', {
                method: 'POST',
                body: JSON.stringify({
                    senderId,
                    receiverId
                })
            });

            setIsSuccess(true);
            setMessage(LN("addMessage"));
            return true;
        } catch (error) {
            setIsSuccess(false);

            if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage(LN("addError"));
            }
            return false;
        }
    }


    function handleInputChange(value: string) {
        setQuery(value)
        handleSearchRequest(value);
    }

    const isTooShort = query.trim().length > 0 && query.trim().length < 3;

    return (
        <div className={styles}>
            <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="!text-sm font-medium lowercase tracking-wide text-text-secondary">{LN("find")}</h3>
                <button
                    type="button"
                    onClick={handleFindModal}
                    aria-label={LN("close")}
                    className="-mr-1 -mt-1 cursor-pointer rounded-md p-1.5 text-text-tertiary transition-colors duration-150 hover:bg-bg-muted hover:text-text-primary lg:hidden"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="relative mb-2 flex items-center gap-2 rounded-md border border-border-default bg-bg-surface py-1.5 pl-8 pr-2.5 transition-colors duration-200 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-soft">
                <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-text-tertiary" />
                <input
                    type="text"
                    placeholder={LN("name")}
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    className="w-full border-none bg-transparent text-sm text-text-primary outline-none placeholder:text-text-tertiary"
                />
            </div>

            {isTooShort && !message && (
                <p className="mb-1 text-xs text-text-tertiary">{LN("minChars")}</p>
            )}

            <FriendsList
                friends={result}
                addFriend={addFriend}
                isSuccess={isSuccess}
                message={message}
            />
        </div>
    )
}
