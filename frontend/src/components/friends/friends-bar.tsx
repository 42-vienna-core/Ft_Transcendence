'use client'

import { useEffect, useState } from 'react';
import style from '../../app/[locale]/(home)/(dashboard)/friends/friends.module.css'
import { apiFetch } from '@/lib/api-client';
import AsideBar from './aside-bar';

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

function FriendsBar() {
    const [friendsArr, setFriendsArr] = useState<Friend[]>([]);
    const [requestsArr, setRequestsArr] = useState<Requests[]>([]);

    useEffect(() => {

        async function getAllFriends() {
            try {
                const [requestsRes, friendsRes] = await Promise.all([
                    apiFetch('friends/request/incoming'),
                    apiFetch('friends'),
                ]);

                setRequestsArr(Array.isArray(requestsRes) ? requestsRes : []);
                setFriendsArr(Array.isArray(friendsRes) ? friendsRes : []);

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
                setFriendsArr(res);
                return;
            }

            setFriendsArr([]);
        } catch (error) {
            console.log("ERROR getting all friends: ", error);
        }
    }

    const removeFriendCard = (id: number) => {
        if (id === 0) return;

        setFriendsArr(prev => prev.filter(f => f.id !== id));
    }

    const removeRequestCard = (id: string) => {
        setRequestsArr(prev => prev.filter(r => r.id !== id));
    }

    const allFriends = friendsArr.length;
    const friensOnline = friendsArr.filter(item => item.isOnline).length;

    return (
        <>
            <div className={style.pageHead}>
                <div>
                    <h1>Friends</h1>
                    <div className={style.pageMeta}>
                        {allFriends} total ·{" "}
                        <span className="text-green-500">{friensOnline} online</span> ·{" "}
                        <span className="text-red-500">1 playing</span>
                    </div>
                </div>
            </div>

            <div className={style.filterBar}>
                <div className={style.chips}>
                    <span className={`${style.chip} ${style.on}`}>
                        All 
                        <span className={style.ct}>{allFriends}</span>
                    </span>
                    <span className={style.chip}>
                        Online 
                        <span className={style.ct}>{friensOnline}</span>
                    </span>
                    <span className={style.chip}>
                        Playing 
                        <span className={style.ct}>1</span>
                    </span>
                </div>
            </div>

            <AsideBar
                requests={requestsArr}
                friends={friendsArr}
                removeRequestCard={removeRequestCard}
                getListOfFriends={getListOfFriends}
                removeFriendCard={removeFriendCard}
            />
        </>
       
    )
} 

export default FriendsBar;