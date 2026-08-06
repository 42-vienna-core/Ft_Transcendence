'use client'

import { useEffect, useState } from 'react';
import style from '../../app/[locale]/(home)/(dashboard)/friends/friends.module.css'
import { apiFetch } from '@/lib/api-client';
import AsideBar from './aside-bar';
import FriendsContent from './friends/friends';

interface Requests {
    id: string;
    sender: {
        id: number;
        name: string;
        avatar?: string | null;
    };
}

interface Friend {
    id: number;
    name: string;
    avatar?: string | null;
    isOnline: boolean;
    score: number;
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

    return (
        <li>
            <button 
                className={`${style.chip}  ${active === label && style.on}`}
                onClick={() => onClick(label)}
            >
                {label }
                <span className={style.ct}>{friendsNumber}</span>
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

    const friendsAll = allFriends.length;
    const friensOnline = allFriends.filter(item => item.isOnline).length;
    const labels = [{'All': friendsAll}, {'Online': friensOnline}, {'Playing': 1}];

    return (
        <>
            <div className={style.pageHead}>
                <div>
                    <h1>Friends</h1>
                    <div className={style.pageMeta}>
                        {friendsAll} total ·{" "}
                        <span className="text-green-500">{friensOnline} online</span> ·{" "}
                        <span className="text-red-500">1 playing</span>
                    </div>
                </div>
            </div>

            <div className={style.filterBar}>
                <ul className={style.chips}>
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

            <div className={style.grid}>
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