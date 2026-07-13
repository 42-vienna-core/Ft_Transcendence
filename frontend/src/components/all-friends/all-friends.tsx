'use client'

import { useEffect, useState } from 'react';
import style from './all-friends.module.css'
import FriendsContent from './friends/friends';
import RequestsContent from './requests/requests';
import FindFriends from './search/search';
import { apiFetch } from '@/lib/api-client';

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
}

function AllFriends() {
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

    return (
        <div className={style.grid}>
            <FriendsContent 
                friends={friendsArr}
                removeFriendCard={removeFriendCard}
            />
            <aside className={style.col}>
                <div className={style.card}>
              <h3>
                <span>Friends this week</span>
                <span className={style.ct}>top 5</span>
              </h3>
              <div className={style.lbRow}>
                <span className={style.pos}>1</span>
                <span className={`${style.dot} ${style.on}`}></span>
                <span className={style.nm}>Mira</span>
                <span className={style.rt}>1920</span>
                <span className={`${style.delta} ${style.up}`}>▲42</span>
              </div>
              <div className={style.lbRow}>
                <span className={style.pos}>2</span>
                <span className={`${style.dot} ${style.on}`}></span>
                <span className={style.nm}>Pengu</span>
                <span className={style.rt}>1850</span>
                <span className={`${style.delta} ${style.up}`}>▲36</span>
              </div>
              <div className={style.lbRow}>
                <span className={style.pos}>3</span>
                <span className={`${style.dot} ${style.off}`}></span>
                <span className={style.nm}>Kostia</span>
                <span className={style.rt}>1760</span>
                <span className={`${style.delta} ${style.up}`}>▲28</span>
              </div>
              <div className={`${style.lbRow} ${style.me}`}>
                <span className={style.pos}>4</span>
                <span className={`${style.dot} ${style.on}`}></span>
                <span className={style.nm}>you</span>
                <span className={style.rt}>1482</span>
                <span className={`${style.delta} ${style.up}`}>▲14</span>
              </div>
              <div className={style.lbRow}>
                <span className={style.pos}>5</span>
                <span className={`${style.dot} ${style.off}`}></span>
                <span className={style.nm}>Lila</span>
                <span className={style.rt}>1480</span>
                <span className={`${style.delta} ${style.dn}`}>▼6</span>
              </div>
                </div>

                <RequestsContent
                    requests={requestsArr}
                    removeRequestCard={removeRequestCard}
                    getListOfFriends={getListOfFriends}
                />

                <FindFriends/>
            </aside>
        </div>
    )
} 

export default AllFriends;