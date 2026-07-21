'use client'

import { useGameSocket } from "@/providers/SocketProvider";
import style from "../../hero/hero.module.css"

import { Globe, Cpu, UserRoundPlus, Loader2, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useGameMode } from "@/components/store/useUserStore";

type GameMode = 'QUICK' | 'FRIEND' | 'CPU';

const cards =  [{
    id: 'CPU' as GameMode,
    title: "vs Computer",
    expl: "Quick solo match. No waiting.",
    btnLabel: "Start match",
    child: <Cpu />
}, {
    id: 'QUICK' as GameMode,
    title: "Quick match",
    expl: "Online matchmaking, balanced by rating.",
    btnLabel: "Find match",
    child: <Globe/>

}, 
// {
//     id: 'FRIEND' as GameMode,
//     title: "With a friend",
//     expl: "Private room. Send invitations to friens who are online.",
//     btnLabel: "Start match",
//     child: <UserRoundPlus />
// }
];

interface MachCard {
    id: GameMode;
    title: string;
    expl: string;
    btnLabel: string,
}

interface StartMathcProps {
    onStartMatch: (matchMode: GameMode) => void;
}


function MatchItem({
    children, 
    card,
    loading,
    handleStartMatch,
    loadingMode,
}: {
    loading: boolean;
    children: React.ReactNode; 
    card: MachCard;
    loadingMode: GameMode | null;
    handleStartMatch: (mode: GameMode) => void;
}) {
    const {title, expl, btnLabel, id} = card;
    const isAnyLoadingMode = loadingMode !== null;

    return (
        <li className="bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] hover:border-[var(--color-focus-ring)] transition-color duration-250 rounded-md p-3.5 flex flex-col gap-2 ">
            <div className="text-[var(--color-info)]">
                {children}
            </div>
            <p className="font-medium text-sm text-[var(--color-text-primary)]">{title}</p>
            <p className="text-xs mb-auto text-[var(--color-text-tertiary)] leading-snug">{expl}</p>

            <p className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1">
                avg. wait ~8 s
            </p>

            {loading && loadingMode === id? (
                <div className="flex items-center justify-center py-2">
                    <Loader className="text-center w-5 h-5 animate-spin" />
                </div>
            ) : (
                <button
                    type="button"
                    disabled={isAnyLoadingMode}
                    className="text-[var(--color-text-secondary)] h-[36px] text-xs  hover:text-[var(--color-info-hover)] font-medium py-2 border border-[var(--color-border-default)] transition-color duration-250 rounded-md flex items-center justify-center gap-1.5 cursor-pointer"
                    onClick={() => handleStartMatch(id)}
                >
                    {btnLabel ? btnLabel: ""}
                </button>
            )}
            
        </li>
    )
} 

function MatchList({
    handleStartMatch,
    loadingMode,
    loading
}: {
    loading: boolean;
    loadingMode: GameMode | null;
    handleStartMatch: (mode: GameMode) => void;
}) {

    return (
        <ul className="grid grid-cols-2 gap-2.5 p-5 pt-4 text-[var(--color-text-secondary)]">
            {cards.map((card) => 
                <MatchItem 
                    key={card.id}
                    card={card}
                    loading={loading}
                    loadingMode={loadingMode}
                    handleStartMatch={handleStartMatch}
                >
                    {card.child}
                </MatchItem>
            )}
        </ul>
    )
} 

function StartMatch () {
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMode, setLoadingMode] = useState<GameMode | null>(null);
    const {setGameMode} = useGameMode();

    const router = useRouter();


    const handleStartMatch = async (mode: GameMode) => {
        setLoading(true);
        setLoadingMode(mode);

        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.log("Event:", mode);
        setGameMode(mode)

        setLoading(false);
        setLoadingMode(null)

        router.push("/arena");
        router.refresh();
    }

    return (
        <div className={style.hero}>
            <div className={style.heroEyebrow}>// Pick how you'd like to play</div>
            <MatchList
                loading={loading}
                loadingMode={loadingMode}
                handleStartMatch={handleStartMatch}
            />
        </div>
    );
}

export default StartMatch;
