'use client'

import { Globe, Cpu, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useGameMode } from "@/components/store/useUserStore";
import { useTranslations } from "next-intl";
import { GameModeType, RoomData } from "@/types/gameTypes";
import LobbyModal from "../modal/lobby-modal";
import { useGameSocket } from "@/providers/SocketProvider";
import { useRoomDataBySocket } from "../store/useRoomData";
import { useProfile } from "@/providers/ProfileContext";
import { useSession } from "next-auth/react";
import { SocketResponse } from "@/types/socketTypes";

interface MachCard {
    id: GameModeType;
    title: string;
    expl: string;
    btnLabel: string,
}

function MatchItem({
    children,
    card,
    loading,
    handleGameMode,
    loadingMode,
}: {
    loading: boolean;
    children: React.ReactNode;
    card: MachCard;
    loadingMode: GameModeType | null;
    handleGameMode: (mode: GameModeType) => void;
}) {
    const {title, expl, btnLabel, id} = card;
    const isAnyLoadingMode = loadingMode !== null;
    const LN = useTranslations("Start_game")

    return (
        <li className="flex flex-col gap-2 rounded-md border border-border-default bg-bg-surface p-3.5 transition-all duration-200 hover:border-accent/40 hover:shadow-lg hover:shadow-accent-soft">
            <div className="text-info">
                {children}
            </div>
            <p className="text-sm font-medium text-text-primary">{title}</p>
            <p className="mb-auto text-xs leading-snug text-text-tertiary">{expl}</p>

            <p className="mt-1 flex items-center gap-1 text-xs text-success">
                {LN("wait_time")}
            </p>

            {loading && loadingMode === id? (
                <div className="flex items-center justify-center py-2">
                    <Loader className="h-5 w-5 animate-spin text-center text-accent" />
                </div>
            ) : (
                <button
                    type="button"
                    disabled={isAnyLoadingMode}
                    className="flex h-[36px] cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border-default text-xs font-medium text-text-secondary transition-colors duration-150 hover:border-accent hover:text-accent-hover active:text-accent-active disabled:cursor-not-allowed disabled:opacity-40"
                    onClick={() => handleGameMode(id)}
                >
                    {btnLabel ? btnLabel: ""}
                </button>
            )}
        </li>
    )
}

function MatchList({
    handleGameMode,
    loadingMode,
    loading,
}: {
    loading: boolean;
    loadingMode: GameModeType | null;
    handleGameMode: (mode: GameModeType) => void;
}) {
    const cpu_t = useTranslations("Start_game.cards.cpu");
    const quick_t = useTranslations("Start_game.cards.quick");
    const quick_f = useTranslations("Start_game.cards.friend")

    const cards =  [{
            id: 'CPU' as GameModeType,
            title: cpu_t("title"),
            expl: cpu_t("expl"),
            btnLabel: cpu_t("label"),
            child: <Cpu />
        },
        {
            id: 'QUICK' as GameModeType,
            title: quick_t("title"),
            expl: quick_t("expl"),
            btnLabel: quick_t("label"),
            child: <Globe/>
        },
        {
            id: 'FRIENDS' as GameModeType,
            title: quick_f("title"),
            expl: quick_f("expl"),
            btnLabel: quick_f("label"),
            child: <Globe/>
        },
    ];

    return (
        <ul className="grid grid-cols-1 gap-2.5 p-5 pt-4 text-text-secondary sm:grid-cols-3">
            {cards.map((card) =>
                <MatchItem
                    key={card.id}
                    card={card}
                    loading={loading}
                    loadingMode={loadingMode}
                    handleGameMode={handleGameMode}
                >
                    {card.child}
                </MatchItem>
            )}
        </ul>
    )
}

function StartMatch () {
    const session = useSession();
    const [loading, setLoading] = useState<boolean>(false);
    const {socket} = useGameSocket();
    const router = useRouter();
    const {gameMode, setIsLobbyOpen, setGameMode, clearStatus, clearGameData} = useRoomDataBySocket();
    const t = useTranslations("Start_game");

    const handleGameMode = async (mode: GameModeType) => {
        if (session.status === "unauthenticated") {
            window.location.href = "/login";
			return;
        }

        if (!socket) return;
        
        setLoading(true);
        setGameMode(mode);
        clearStatus();

		socket.timeout(10000).emit('join-match', {mode}, (timeoutError: Error | null, response?: SocketResponse<unknown>) =>{
			if (timeoutError || !response?.success)
				clearGameData();
		})

        if (mode === 'CPU') {
            router.push("/arena");
            router.refresh();
            setLoading(false);
            return;
        }

        setIsLobbyOpen(true);
        setLoading(false);
    }

    return (
        <>
            <div className="relative px-4 pt-10 text-center sm:px-8 sm:pt-20">
               <div className="mono mb-8 inline-block rounded-full border border-accent bg-accent/5 px-3.5 py-1.5 text-xs uppercase tracking-[0.2em] text-accent">
                   // {t("title")}
               </div>
               <MatchList
                   loading={loading}
                   loadingMode={gameMode}
                   handleGameMode={handleGameMode}
               />
            </div>
        </>
       
    );
}

export default StartMatch;
