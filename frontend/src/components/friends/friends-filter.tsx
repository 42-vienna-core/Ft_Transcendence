'use client'

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import AsideBar from './aside-bar';
import FriendsContent from './friends-list';
import { ActiveFilterType, Friend, Request } from '@/types/gameTypes';
import { useNotificationListener } from '../store/notification';
import { NotificationSign } from '@/ui/link';
import FriendRequests from './friend-requests';

interface SharedBtnProps {
    label: ActiveFilterType;
    friendsNumber: number;
    active: ActiveFilterType;
    onClick: (compType: ActiveFilterType) => void;
}


export function SharedBtn({
    label,
    friendsNumber,
    onClick,
    active,
}:SharedBtnProps) {
    const {gameNotification, beFriendNotification} = useNotificationListener();
    const isActive = active === label;

    return (
        <li>
            <button
                className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${
                    isActive
                        ? 'border-transparent bg-accent text-text-inverse'
                        : 'border-border-default text-text-secondary hover:border-accent hover:text-accent-hover active:text-accent-active'
                }`}
                onClick={() => onClick(label)}
            >    
                { 
                    label === 'Online' && 
                        <NotificationSign 
                            notif={gameNotification}
                            positionCss={"absolute left-0 bottom-5"}
                        />
                }
                { 
                    label === 'Requests' && 
                        <NotificationSign 
                            notif={beFriendNotification}
                            positionCss={"absolute left-0 bottom-5"}
                        />
                }
                {label}
                <span className={`text-xs ${isActive ? 'opacity-80' : 'opacity-70'}`}>{friendsNumber}</span>
            </button>
        </li>
    );
}

function FriendsFilter() {
    const [allFriends, setAllFriends] = useState<Friend[]>([]);
    const [requestsArr, setRequestsArr] = useState<Request[]>([]);
    const [activeFilter, setActiveFilter] = useState<ActiveFilterType>('All');
    const {gameRequests, friendRequests, playFriends} = useNotificationListener();

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
    },[gameRequests, friendRequests])

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
        setActiveFilter(compType);
    }

    const removeFriendCard = (id: number) => {
        if (id === 0) return;
        setAllFriends(prev => prev.filter(f => f.id !== id));
    }

    const friendsAll = allFriends.length;
    const friensOnline = allFriends.filter(item => item.isOnline).length;
    const totalPlayingFriends = playFriends.reduce((sum, it) => sum + it.roomUsers.length, 0)
    const labels = [
        {'All':friendsAll},
        {'Online': friensOnline},
        {'Playing': totalPlayingFriends},
        {'Requests': requestsArr.length}
    ];

    return (
        <>
            <div className="mb-3.5 flex items-end justify-between">
                <div>
                    <h1 className="m-0 !text-2xl font-medium">Friends</h1>
                    <div className="mt-1 text-sm text-text-secondary">
                        {friendsAll} total ·{" "}
                        <span className="text-success">{friensOnline} online</span> ·{" "}
                        <span className="text-danger">{totalPlayingFriends} playing</span>
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
                <FriendRequests
                    requests={requestsArr}
                    filter={activeFilter}
                    getListOfFriends={getListOfFriends}
                />
                <AsideBar/>
            </div>
        </>
    )
}

export default FriendsFilter;
