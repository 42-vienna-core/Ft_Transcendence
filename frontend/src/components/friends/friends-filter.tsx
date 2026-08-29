'use client'

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { getErrorMessage } from '@/lib/error';
import { toast } from 'sonner';
import FindFriends from './search';
import FriendsContent from './friends-list';
import { ActiveFilterType, Friend, Request } from '@/types/gameTypes';
import { useNotificationListener } from '../store/notification';
import { NotificationSign } from '@/ui/link';
import FriendRequests from './friend-requests';
import { FriendsContentSkeleton, SkeletonBlock } from '@/ui/skeletons';

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
}: SharedBtnProps) {
    const { gameNotification, beFriendNotification } = useNotificationListener();
    const isActive = active === label;

    return (
        <li>
            <button
                className={`relative inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150 ${isActive
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
    const [isFindOpen, setIsFindOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { gameRequests, friendRequests, playFriends, status } = useNotificationListener();

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
            } finally {
                setIsLoading(false);
            }
        }

        getAllFriends();
    }, [gameRequests, friendRequests])

    const getListOfFriends = async () => {
        try {
            const res = await apiFetch('friends');

            if (Array.isArray(res) && res.length != 0) {
                setAllFriends(res);
                return;
            }

            setAllFriends([]);
        } catch (error) {
            toast.error(getErrorMessage(error, "Couldn't refresh your friends list."));
        }
    }

    const handleOnClick = (compType: ActiveFilterType) => {
        setActiveFilter(compType);
    }

    const removeFriendCard = (id: number) => {
        if (id === 0) return;
        setAllFriends(prev => prev.filter(f => f.id !== id));
    }

    const handleFindModal = () => setIsFindOpen(!isFindOpen);

    const friendsAll = allFriends.length;
    const friensOnline = allFriends.filter(item => item.isOnline).length;
    const totalPlayingFriends = status === 'PLAYING' ?
        playFriends.reduce((sum, it) => sum + it.roomUsers.length, 0) : 0;

    const labels = [
        { 'All': friendsAll },
        { 'Online': friensOnline },
        { 'Playing': totalPlayingFriends },
        { 'Requests': requestsArr.length }
    ];

    return (
        <>
            <div className="mb-3.5 flex items-end justify-between">
                <div>
                    <h1 className="m-0 !text-2xl font-medium">Friends</h1>
                    {isLoading ? (
                        <SkeletonBlock className="mt-1.5 h-3.5 w-40 rounded-sm bg-bg-muted" />
                    ) : (
                        <div className="mt-1 text-sm text-text-secondary">
                            {friendsAll} total ·{" "}
                            <span className="text-success">{friensOnline} online</span> ·{" "}
                            <span className="text-danger">{totalPlayingFriends} playing</span>
                        </div>
                    )}
                </div>
                <button
                    type="button"
                    onClick={handleFindModal}
                    className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-border-default px-3 py-1.5 text-sm font-medium text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent-hover active:text-accent-active lg:hidden"
                >
                    <Search className="h-3.5 w-3.5" />
                    Find friends
                </button>
            </div>
            <div className="mb-3.5 flex items-center justify-between">
                <ul className="flex flex-wrap gap-1.5">
                    {labels.map((it) => {
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

            {isLoading ? (
                <FriendsContentSkeleton friendNumber={3} />
            ) : (
                <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[1.6fr_1fr]">
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
                    <FindFriends
                        styles={`rounded-md bg-bg-subtle px-3.5 py-3 hidden lg:block`}
                        handleFindModal={handleFindModal}
                    />
                </div>
            )}

            {isFindOpen && (
                <div className="fixed  inset-0 z-50 flex items-center justify-center bg-[var(--color-bg-overlay)] p-4 backdrop-blur-sm">
                    <div
                        className="h-full relative w-full max-w-md"
                        style={{ color: "var(--color-text-primary)", fontFamily: "var(--font-sans)" }}
                    >
                        <FindFriends
                            styles={"absolute top-15 right-0 rounded-md max-w-md bg-bg-subtle px-3.5 py-3"}
                            handleFindModal={handleFindModal}
                        />
                    </div>

                </div>
            )}
        </>
    )
}

export default FriendsFilter;
