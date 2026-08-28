'use client'

import { useEffect, useState } from "react";
import LeaderboardList from "./leaderboardList";
import TopThreePodium from "./topThreePodium";
import { apiFetch } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/error";
import { toast } from "sonner";
import { LeaderboardData } from "@/types/gameTypes";

export default function LeaderboardComponent() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardData[]>([]);

    useEffect(() => {
        async function fetchAllLeaderBoard() {
            try {
                const response = await apiFetch('user/leaderboard');
                setLeaderboard(Array.isArray(response) ? response : []);
            } catch (error) {
                toast.error(getErrorMessage(error, "Couldn't load the leaderboard."));
            }
        }

        fetchAllLeaderBoard();
    }, [])

    const sorted = leaderboard.sort((a, b) => a.rank - b.rank);
    const top3 = sorted.slice(0,3);
    const rest = sorted.slice(3);

    return (
        <div className="px-5 pt-[18px] pb-[22px]">
            <div className="mb-4 flex items-end justify-between">
                <div>
                    <h1 className="m-0 !text-[22px] font-medium text-text-primary">Leaderboard</h1>
                    <div className="mt-1 text-xs text-text-secondary">top players by score · all time </div>
                </div>
            </div>
            <TopThreePodium 
                top3={top3}
            />
            <LeaderboardList
                rest={rest}
            />
        </div>
    )
}