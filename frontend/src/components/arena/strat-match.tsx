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
    handleRoomLobby,
    loadingMode,
}: {
    loading: boolean;
    children: React.ReactNode;
    card: MachCard;
    loadingMode: GameModeType | null;
    handleRoomLobby: (mode: GameModeType) => void;
}) {
    const {title, expl, btnLabel, id} = card;
    const isAnyLoadingMode = loadingMode !== null;

    return (
        <li className="flex flex-col gap-2 rounded-md border border-border-default bg-bg-surface p-3.5 transition-all duration-200 hover:border-accent/40 hover:shadow-lg hover:shadow-accent-soft">
            <div className="text-info">
                {children}
            </div>
            <p className="text-sm font-medium text-text-primary">{title}</p>
            <p className="mb-auto text-xs leading-snug text-text-tertiary">{expl}</p>

            <p className="mt-1 flex items-center gap-1 text-xs text-success">
                avg. wait ~8 s
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
                    onClick={() => handleRoomLobby(id)}
                >
                    {btnLabel ? btnLabel: ""}
                </button>
            )}
        </li>
    )
}

function MatchList({
    handleRoomLobby,
    loadingMode,
    loading,
}: {
    loading: boolean;
    loadingMode: GameModeType | null;
    handleRoomLobby: (mode: GameModeType) => void;
}) {
    const cpu_t = useTranslations("Start_game.cards.cpu");
    const quick_t = useTranslations("Start_game.cards.quick");

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
            title: "Match with friends",
            expl: "A room for playing with friends.",
            btnLabel: "Create match",
            child: <Globe/>
        },
    ];

    return (
        <ul className="grid grid-cols-3 gap-2.5 p-5 pt-4 text-text-secondary">
            {cards.map((card) =>
                <MatchItem
                    key={card.id}
                    card={card}
                    loading={loading}
                    loadingMode={loadingMode}
                    handleRoomLobby={handleRoomLobby}
                >
                    {card.child}
                </MatchItem>
            )}
        </ul>
    )
}

function StartMatch () {
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingMode, setLoadingMode] = useState<GameModeType | null>(null);
    const [isLobbyOpen, setIsLobbyOpen] = useState<boolean>(false);
    const {socket} = useGameSocket();
    const {roomData} = useRoomDataBySocket();
    const {setGameMode} = useGameMode();
    const t = useTranslations("Start_game");

    const router = useRouter();

    const handleModalClose = () => {
        setLoadingMode(null);
        setLoading(false);
        setIsLobbyOpen(false);
    }

    const handleRoomLobby = async (mode: GameModeType) => {
        if (!socket) return;
        
        setLoading(true);
        setLoadingMode(mode);
        console.log("MODE: ", mode);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        socket.emit('join-match', {mode});
        // setGameMode(mode)

        setIsLobbyOpen(true);
        setLoading(false);
    }

    console.log(roomData);

    const handleStartMatch = () => {
        console.log("Start match");
        console.log("Send 'LOBBY' status");

        // setGameMode('RUNNING')
        //star the game and go into the arena page

        router.push("/arena");
        router.refresh();
    }

    return (
        <>
            <div className="relative px-8 pt-20 text-center">
               <div className="mono mb-8 inline-block rounded-full border border-accent bg-accent/5 px-3.5 py-1.5 text-xs uppercase tracking-[0.2em] text-accent">
                   // {t("title")}
               </div>
               <MatchList
                   loading={loading}
                   loadingMode={loadingMode}
                   handleRoomLobby={handleRoomLobby}
               />
            </div>
            <LobbyModal
                isOpen={isLobbyOpen}
                onClose={handleModalClose}
                onStartmatch={handleStartMatch}
                roomData={roomData}
            />
        </>
       
    );
}

export default StartMatch;
