"use client";

import style from "./requests.module.css";
import { apiFetch } from "@/lib/api-client";

interface Requests {
    id: string;
    sender: {
        id: number;
        name: string;
        avatar?: string | null;
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
    const {name, avatar} = sender;
    const av = name && typeof name === "string" ? name.slice(0, 2) : "";

    return (
        <li className={style.sugRow}>
            <div
                className={`${style.av} bg-[var(--color-snake-1)] text-[var(--color-text-primary)] capitalize`}
                style={{ color: "var(--color-info-text)" }}
            >
                {av}
            </div>
            <div>
                <p className={style.name}>{name}</p>
                <p className={style.metaR}>5 mutual friends</p>
            </div>
            <div className={style.reqActions}>
                <button className={`${style.iconBtn} ${style.accept}`} onClick={() => makeDecision(id, true)}>
                    +
                </button>
                <button className={`${style.iconBtn} ${style.decline}`} onClick={() => makeDecision(id, false)}>
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
            // await new Promise((resolve) => setTimeout(resolve, 4000));

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
            <div className={style.card}>
                <h3>
                    <span>Pending requests</span>
                    <span className={style.ct}>{requests.length}</span>
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