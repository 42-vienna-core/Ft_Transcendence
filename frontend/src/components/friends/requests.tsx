"use client";

import { OnlineStateItem } from "@/ui/online-tracker";
import { apiFetch } from "@/lib/api-client";

interface Requests {
    id: string;
    sender: {
        id: number;
        name: string;
        avatar?: string | null;
        isOnline: boolean;
        score: number;
    };
}

interface RequestItemProps {
    request: Requests;
    makeDecision: (id: string, isProve: boolean) => void;
}

interface RequestListProps {
    requests: Requests[];
    makeDecision: (id: string, isProve: boolean) => void;
}

interface RequestContentProps {
    requests: Requests[];
    removeRequestCard: (id:string) => void
    getListOfFriends: () => void;
}

function RuquestCard({request:{id, sender}, makeDecision}: RequestItemProps) {
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
                    onClick={() => makeDecision(id, true)}
                >
                    +
                </button>
                <button
                    className="flex size-[26px] cursor-pointer items-center justify-center rounded-md border border-border-default text-base text-text-secondary transition-colors duration-150 hover:border-danger hover:text-danger"
                    onClick={() => makeDecision(id, false)}
                >
                    -
                </button>
            </div>
        </li>
    );
}

function RequestList({ requests, makeDecision }: RequestListProps) {
    return (
        <ul>
        {requests.length > 0 &&
            requests.map(requests => (
                <RuquestCard
                    key={`friend-${requests.id}`}
                    request={requests}
                    makeDecision={makeDecision} />
            ))}
        </ul>
    );
}

function RequestsContent({requests, removeRequestCard, getListOfFriends}: RequestContentProps) {

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

            removeRequestCard(id);
        } catch (error) {
            console.log("ERROR: ", error);
        }
    }

    if (requests && requests.length > 0) {
        return (
            <div className="rounded-md bg-bg-subtle px-3.5 py-3">
                <h3 className="mb-2 flex items-center justify-between !text-sm font-medium lowercase tracking-wide text-text-secondary">
                    <span>Pending requests</span>
                    <span className="text-xs font-normal text-text-tertiary">{requests.length}</span>
                </h3>
                <RequestList
                    requests={requests}
                    makeDecision={makeDecision}
                />
            </div>
        );
    }
}

export default RequestsContent;
