"use client";

import { OnlineStateItem } from "@/ui/online-tracker";
import { apiFetch } from "@/lib/api-client";
import { useNotificationListener } from "../store/notification";
import { ActiveFilterType, Request} from "@/types/gameTypes";
import { useTranslations } from "next-intl";

interface FriendRequestItemProps {
    request: Request;
    makeDecision: (id: string, isProve: boolean) => void;
}


interface RequestListProps {
    requests: Request[];
    makeDecision: (id: string, isProve: boolean) => void;
}

interface RequestContentProps {
    requests: Request[];
    filter: ActiveFilterType;
    getListOfFriends: () => void;
}

function FriendRuquestItem({
    request:{id, sender}, 
    makeDecision
}: FriendRequestItemProps ) {
    const {name, avatar, isOnline} = sender;
    const av = name && typeof name === "string" ? name.slice(0, 2) : "";
    const isAvatar = !!avatar;
    const LN = useTranslations("friends.request");

    return (
        <li className="grid grid-cols-[26px_1fr_auto] items-start gap-4 rounded-md border border-border-default bg-bg-surface p-2.5 transition-colors duration-150 hover:border-border-strong">
            <div>
                { isAvatar ? (
                    <img className="size-[32px] rounded-full object-cover" src={avatar ? avatar : ""} alt="avatar" />
                ) : (
                    <div className="flex size-[32px] items-center justify-center rounded-full bg-snake-1 text-xs font-medium capitalize text-info-text">
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
                    className="flex p-1.5 cursor-pointer items-center justify-center rounded-md border border-transparent bg-success-soft text-base text-success-text transition-colors duration-150 hover:bg-accent hover:text-text-inverse"
                    onClick={() => makeDecision(id, true)}
                >
                    {LN("accept")}
                </button>
                <button
                    className="flex  p-1.5 cursor-pointer items-center justify-center rounded-md border border-border-default text-base text-text-secondary transition-colors duration-150 hover:border-danger hover:text-danger"
                    onClick={() => makeDecision(id, false)}
                >
                    {LN("decline")}
                </button>
            </div>
        </li>
    );
}


function RequestList({ requests, makeDecision }: RequestListProps) {
    return (
        <ul className="flex flex-col gap-2">
            {
                requests.length > 0 &&
                    requests.map(request => (
                        <FriendRuquestItem
                            key={`friend-${request.id}`}
                            request={request}
                            makeDecision={makeDecision} 
                        />
                    )
                )
            }
        </ul>
    );
}

function FriendRequests({
    requests,
    filter,
    getListOfFriends
}: RequestContentProps) {
    const { removeRequestById } = useNotificationListener();
    const LN = useTranslations("friends.request");

    async function makeDecision(id: string, isProv: boolean) {
        if (typeof id === 'string' && id.length === 0) return;

        const url = `friends/request/${String(id)}`
        try {
            if (isProv){
                await apiFetch(`${url}/accept`, {method: 'PATCH'});
                getListOfFriends();
            } else {
                await apiFetch(`${url}/reject`, {method: 'PATCH'});
            }

            removeRequestById(id);
        } catch (error) {
            console.log("ERROR: ", error);
        }
    }

    if (filter !== 'Requests') return null

    if (requests.length === 0) {
        return  (
            <div className="flex min-w-0 flex-col gap-2.5">
                <p className="text-sm text-warning-text">{LN("noRequests")}</p>
            </div>
        )
    }

    return (
        <RequestList
            requests={requests}
            makeDecision={makeDecision}
        />
    );
}

export default FriendRequests;
