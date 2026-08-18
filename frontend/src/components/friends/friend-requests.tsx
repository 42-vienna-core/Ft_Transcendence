"use client";

import { OnlineStateItem } from "@/ui/online-tracker";
import { apiFetch } from "@/lib/api-client";
import { useNotificationListener } from "../store/notification";
import { FriendRequestData, GameRequestData } from "@/types/gameTypes";
import { useFriendAndRoomID, useGameMode } from "../store/useUserStore";
import { useRouter } from "next/navigation";

interface FriendRequestItemProps {
    request: FriendRequestData;
    makeDecision: (id: string, isProve: boolean, isGameReq: boolean) => void;
}

interface GameRequestItemProps {
    gameRequest: GameRequestData;
    makeDecision: (id: string, isProve: boolean, isGameReq: boolean) => void;
}

interface RequestListProps {
    requests: FriendRequestData[];
    gameRequests: GameRequestData[]
    makeDecision: (id: string, isProve: boolean, isGameReq: boolean) => void;
}

interface RequestContentProps {
    requests: FriendRequestData[];
    removeRequestCard: (id:string) => void
    getListOfFriends: () => void;
}

function FriendRuquestItem({
    request:{id, sender}, 
    makeDecision
}: FriendRequestItemProps ) {
    const {name, avatar, isOnline} = sender;
    const av = name && typeof name === "string" ? name.slice(0, 2) : "";
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
                <OnlineStateItem isOnline={isOnline}/>
            </div>
            <div className="flex gap-1">
                <button
                    className="flex size-[26px] cursor-pointer items-center justify-center rounded-md border border-transparent bg-success-soft text-base text-success-text"
                    onClick={() => makeDecision(id, true, false)}
                >
                    +
                </button>
                <button
                    className="flex size-[26px] cursor-pointer items-center justify-center rounded-md border border-border-default text-base text-text-secondary transition-colors duration-150 hover:border-danger hover:text-danger"
                    onClick={() => makeDecision(id, false, false)}
                >
                    -
                </button>
            </div>
        </li>
    );
}

// function GameRuquestItem({
//     gameRequest: { roomId, inviter }, 
//     makeDecision
// }: GameRequestItemProps ) {
//     const {name, avatar} = inviter;
//     const av = name && typeof name === "string" ? name.slice(0, 2) : "";
//     const isAvatar = !!avatar;

//     return (
//         <li className="grid grid-cols-[26px_1fr_auto] items-center gap-2 py-1.5 text-sm">
//             <div>
//                 { isAvatar ? (
//                     <img className="size-[26px] rounded-full object-cover" src={avatar ? avatar : ""} alt="avatar" />
//                 ) : (
//                     <div className="flex size-[26px] items-center justify-center rounded-full bg-snake-1 text-xs font-medium capitalize text-info-text">
//                         {av}
//                     </div>
//                 )}
//             </div>
//             <div className="min-w-0">
//                 <p className="text-base font-medium">{name}</p>
//                 <OnlineStateItem isOnline={true}/>
//             </div>
//             <div className="flex gap-1">
//                 <button
//                     className="flex cursor-pointer items-center justify-center rounded-md border border-transparent bg-success-soft text-base text-success-text"
//                     onClick={() => makeDecision(roomId, true, true)}
//                 >
//                     join
//                 </button>
//                 <button
//                     className="flex cursor-pointer items-center justify-center rounded-md border border-border-default text-base text-text-secondary transition-colors duration-150 hover:border-danger hover:text-danger"
//                     onClick={() => makeDecision(roomId, false, true)}
//                 >
//                     cancel
//                 </button>
//             </div>
//         </li>
//     );
// }

function RequestList({ requests, gameRequests, makeDecision }: RequestListProps) {

    return (
        <ul>
            {
                requests.length > 0 &&
                    requests.map(request => (
                        <FriendRuquestItem
                            key={`friend-${request.id}`}
                            request={request}
                            makeDecision={makeDecision} />
                    )
                )
            }
            {/* {
                gameRequests.length > 0 &&
                    gameRequests.map(request => (
                        <GameRuquestItem
                            key={request.roomId}
                            gameRequest={request}
                            makeDecision={makeDecision} />
                    )
                )
            } */}
        </ul>
    );
}

function FriendRequests({
    requests,
    removeRequestCard, 
    getListOfFriends
}: 
    RequestContentProps
) {
    const { gameRequests } = useNotificationListener();
    const { setRoomId, resetIds } = useFriendAndRoomID();
    const router = useRouter();

    async function makeDecision(id: string, isProv: boolean, isGameReq: boolean) {
        if (typeof id === 'string' && id.length === 0) return;

        const url = `friends/request/${String(id)}`

        if (isGameReq) {
            isProv ? setRoomId(id) : resetIds();

            await new Promise((resolve) => setTimeout(resolve, 1000));

            router.push("/arena");
            router.refresh();
        }

        try {
            if (isProv){
                await apiFetch(`${url}/accept`, {method: 'PATCH'});
                getListOfFriends();
            } else {
                await apiFetch(`${url}/reject`, {method: 'PATCH'});
            }

            removeRequestCard(id);
        } catch (error) {
            console.log("ERROR: ", error);
        }
    }

    // if (requests && requests.length > 0) {
        return (
            <div className="rounded-md bg-bg-subtle px-3.5 py-3">
                <h3 className="mb-2 flex items-center justify-between !text-sm font-medium lowercase tracking-wide text-text-secondary">
                    <span>Pending requests</span>
                    <span className="text-xs font-normal text-text-tertiary">{requests.length}</span>
                </h3>
                <RequestList
                    requests={requests}
                    gameRequests={gameRequests}
                    makeDecision={makeDecision}
                />
            </div>
        );
    // }
}

export default FriendRequests;
