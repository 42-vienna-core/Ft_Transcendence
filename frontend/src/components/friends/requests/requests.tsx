"use client";

import { useEffect, useState } from "react";
import style from "./requests.module.css";
import { useProfile } from "@/providers/ProfileContext";
import { apiFetch } from "@/lib/api-client";

interface Requests {
    id: string;
    sender: {
        id: number;
        name: string;
        avatar?: string | null;
    };
}

interface RequestCardProps {
    request: Requests; 
    makeDecision: (id: string, isProve: boolean) => void;
}

interface RequestListProps {
    requests: Requests[];
    makeDecision: (id: string, isProve: boolean) => void;
}

function RuquestCard({request:{id, sender}, makeDecision}: RequestCardProps) {
    const {name, avatar} = sender;
    const av = name && typeof name === "string" ? name.slice(0, 2) : "";

    return (
        <li key={id} className={style.sugRow}>
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
                    request={requests}
                    makeDecision={makeDecision} />
            ))}
        </ul>
    );
}

export default function ListOfRequests() {
    const userContext = useProfile();
    const [result, setResult] = useState<Requests[]>([]);

    useEffect(() => {
        const fetchIncomingRequests = async () => {
            try {
                const res = await apiFetch('friends/request/incoming');
                console.log("PENDING REQUESTS: ", res);

                if (Array.isArray(res) && res.length != 0) {
                    setResult(res);
                    return 
                }

                setResult([]);

            } catch (error) {
                console.log("ERROR (getting pending list of requests): ", error);
            }
        };

        fetchIncomingRequests();

    }, []);

    async function makeDecision(id: string, isProv: boolean) {
        if (typeof id === 'string' && id.length === 0) return;

        const url = `friends/request/${String(id)}`

        try {
            if (isProv){
                await apiFetch(`${url}/accept`, {method: 'PATCH'});
            } else {
                await apiFetch(`${url}/reject`, {method: 'PATCH'});
            }

            setResult((reguests) => reguests.filter(req => req.id !== id));
        } catch (error) {
            console.log("ERROR: ", error);
        }
    }

    if (result && result.length > 0) {
        return (
            <div className={style.card}>
                <h3>
                    <span>Pending requests</span>
                    <span className={style.ct}>{result.length}</span>
                </h3>
                <RequestList
                    requests={result}
                    makeDecision={makeDecision}
                />
            </div>
        );
    }
}
