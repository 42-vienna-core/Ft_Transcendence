'use client'

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import AsideBar from './aside-bar';
import FriendsContent from './friends-list';
import { Friend } from '@/types/gameTypes';
import { useNotificationListener } from '../store/notification';

interface Requests {
    id: string;
    sender: Friend;
}

type ActiveFilterType = 'All' | 'Online' | 'Playing';

export function SharedBtn({
    label,
    friendsNumber,
    onClick,
    active,
}:{
    label: ActiveFilterType;
    friendsNumber: number;
    active: ActiveFilterType;
    onClick: (compType: ActiveFilterType) => void;
}) {
    const isActive = active === label;

    return (
        <li>
            <button
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                    isActive
                        ? 'border-transparent bg-accent text-text-inverse'
                        : 'border-border-default text-text-secondary hover:border-accent hover:text-accent-hover active:text-accent-active'
                }`}
                onClick={() => onClick(label)}
            >
                {label}
                <span className={`text-xs ${isActive ? 'opacity-80' : 'opacity-70'}`}>{friendsNumber}</span>
            </button>
        </li>
    );
}

function FriendsBar() {
    const [allFriends, setAllFriends] = useState<Friend[]>([]);
    const [requestsArr, setRequestsArr] = useState<Requests[]>([]);
    const [activeFilter, setActiveFilter] = useState<ActiveFilterType>('All');

    useEffect(() => {

        async function getAllFriends() {
            try {
                const [requestsRes, friendsRes] = await Promise.all([
                    apiFetch('friends/request/incoming'),
                    apiFetch('friends'),
                ]);

                setRequestsArr(Array.isArray(requestsRes) ? requestsRes : []);
                setAllFriends(Array.isArray(friendsRes) ? friendsRes : []);

            } catch (error) {
                console.log("ERROR Parallel data fetching: ", error)
            }
        }

        getAllFriends();
    },[])

    const getListOfFriends = async () => {
        try {
            const res = await apiFetch('friends');

            if (Array.isArray(res) && res.length != 0) {
                setAllFriends(res);
                return;
            }

            setAllFriends([]);
        } catch (error) {
            console.log("ERROR getting all friends: ", error);
        }
    }

    const handleOnClick = (compType: ActiveFilterType) => {
        console.log(compType);
        setActiveFilter(compType);
    }

    const removeFriendCard = (id: number) => {
        if (id === 0) return;

        setAllFriends(prev => prev.filter(f => f.id !== id));
    }

    const removeRequestCard = (id: string) => {
        setRequestsArr(prev => prev.filter(r => r.id !== id));
    }
    console.log(allFriends);
    const friendsAll = allFriends.length;
    const friensOnline = allFriends.filter(item => item.isOnline).length;
    const labels = [{'All': friendsAll}, {'Online': friensOnline}, {'Playing': 1}];

    return (
        <>
            <div className="mb-3.5 flex items-end justify-between">
                <div>
                    <h1 className="m-0 !text-2xl font-medium">Friends</h1>
                    <div className="mt-1 text-sm text-text-secondary">
                        {friendsAll} total ·{" "}
                        <span className="text-success">{friensOnline} online</span> ·{" "}
                        <span className="text-danger">1 playing</span>
                    </div>
                </div>
            </div>

            <div className="mb-3.5 flex items-center justify-between">
                <ul className="flex gap-1.5">
                    {labels.map((it)=> {
                        const labelText = Object.keys(it)[0] as ActiveFilterType;
                        const friendsNum = Object.values(it)[0];

                        return (
                            <SharedBtn
                                key={`${labelText}-filter-bar`}
                                label={labelText}
                                friendsNumber={friendsNum}
                                onClick={handleOnClick}
                                active={activeFilter}
                            />
                        );
                    })}
                </ul>
            </div>

            <div className="grid grid-cols-[1.6fr_1fr] gap-3.5">
                <FriendsContent
                    friends={allFriends}
                    filter={activeFilter}
                    removeFriendCard={removeFriendCard}
                />
                <AsideBar
                    requests={requestsArr}
                    removeRequestCard={removeRequestCard}
                    getListOfFriends={getListOfFriends}
                />
            </div>
        </>
    )
}

export default FriendsBar;
