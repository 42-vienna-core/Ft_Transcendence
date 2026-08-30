'use client'

import { useFriendAndRoomID, useGameMode, usePlayerStore } from "@/components/store/useUserStore"
import { useGameSocket } from "@/providers/SocketProvider";
import { useState, useEffect, useRef, ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { Loader, UserRound } from "lucide-react";
import GameCanvas from "./game-canvas";
import { useRouter } from 'next/navigation';
import { ControlType, Direction, Game, GameState, RoomData, RoomStateType, RoomStatusType, TICK_MS } from "@/types/gameTypes";
import { useProfile } from "@/providers/ProfileContext";
import { useTranslations } from "next-intl";
import { useNotificationListener } from "../store/notification";
import { useRoomDataBySocket } from "../store/useRoomData";
import { useAudioStore } from "../store/useAudioStore";
import { getOrdinal } from "@/ui/utils";

// function normalizeRoomStatus(raw: RoomStatusType | undefined): RoomStatusType | 'UNKNOWN'{
//     if (!raw) return 'UNKNOWN';
//     const s = raw.toUpperCase();
//     if (s === 'WAITING') return 'WAITING';
//     if (s === 'ABANDONED') return 'ABANDONED';
//     if (s === 'FINISHED') return 'FINISHED';
//     if (s === 'READY' || s === 'RUNNING' || s === 'PLAYING' || s === 'STARTED') return 'READY';
//     return 'UNKNOWN';
// }

function formatTime(totalSeconds: number): string {
    if (!totalSeconds) return "00:00";

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');

    return `${mStr}:${sStr}`;
}


function Kbd({ children, active, activeClass = "text-accent-text" }: { children: ReactNode; active?: boolean; activeClass?: string }) {
    return (
        <span className={`inline-block rounded-sm border border-border-default bg-bg-base px-1.5 py-0.5 font-mono text-xs ${active ? activeClass : ""}`}>
            {children}
        </span>
    );
}

function ArenaContent() {
    // const [ gameState, setGameState ] = useState<GameState | null>(null);
    const [ gameDir, setGameDir ] = useState<Direction | null>(null);
    const [ control, setControl ] = useState<ControlType>('arrow');
    const [ tick, setTick ] = useState<number>(0);

    const { isConnected, socket } = useGameSocket();
    const router = useRouter();


    const players = usePlayerStore((state) => state.players);
    const setPlayers = usePlayerStore((state) => state.setPlayers);
    const resetPlayers = usePlayerStore((state) => state.resetPlayers);

    const joinedSocketRef = useRef<Socket | null>(null);
    const r = useRef<boolean>(false);
    const { id } = useProfile();
    const LN = useTranslations("arena");
    const {room, countdown, roomStatus, gameStatus, clearStatus, setIsLobbyOpen} = useRoomDataBySocket();
    const { playMusic, toggleMute, stopEffectMusic, stopBgMusic, playEffect} = useAudioStore();

    const initCountDown = countdown ? countdown.countdown : 3;
    const [secondsLeft, setSecondsLeft] = useState(initCountDown);

    useEffect(() => {
        if (!(gameStatus || roomStatus)) {
            router.replace('/');
        } else {
            r.current = true;
        }

        const soundFlagLs = localStorage.getItem('soundtrack');
        if (soundFlagLs) {
            const parsedSoundFlag = JSON.parse(soundFlagLs)
            toggleMute(parsedSoundFlag);
        } else {
            toggleMute(true);
            localStorage.setItem('soundtrack', "true");
        }

        if (gameStatus === 'OVER') {
            playMusic('/sounds/bone-crack.mp3', false);
            playMusic('/sounds/game-over.mp3', false);
        } else if (gameStatus === 'WIN') {
            playMusic('/sounds/winning-in-fortnite-be-like.mp3', false);
        }

        return () => {
            stopBgMusic()
        };
    }, [room, playMusic, stopBgMusic]);

    useEffect(() => {
        setSecondsLeft(initCountDown);
        const interval = setInterval(() => {
            setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            clearInterval(interval);
            setIsLobbyOpen(false);
        };
    }, [room, countdown]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleGameState = (data: Game) => {
            // console.log("game-state", data);
            setPlayers(data.snakes);
            setTick(data.tick);
        }

        socket.on("game-state", handleGameState);

        if (joinedSocketRef.current !== socket) {
            joinedSocketRef.current = socket;
        }

        const setUpContol = () => {
            const controlLS = localStorage.getItem('controls') as ControlType;
            if(controlLS) {
                setControl(controlLS) ;
            }
        }

        setUpContol();

        return () => {
            socket.off("game-state", handleGameState);
            resetPlayers();
        };
    }, [socket, isConnected, setPlayers, router]);

    if (r.current === false) return null;

    function handleRestart() {
        clearStatus();
        router.push('/');
        router.refresh();
    }

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const myScore = players.find(it => it.id === id)?.score ?? 0;
    const myIndex = sortedPlayers.findIndex(it => it.id === id);
    const ordinalPos = getOrdinal(myIndex + 1);
    const elapsedSeconds = Math.floor((tick * TICK_MS) / 1000);

    const maxLenRoomId = 10;
    const roomName = room && room.roomId.length > maxLenRoomId ?
        room.roomId.slice(0, maxLenRoomId):
        room?.roomId;

    const showOver = gameStatus=== 'OVER' ;
    const showWin = gameStatus === 'WIN';

    return (
        <div className="grid grid-cols-1 w-full lg:grid-cols-5">
            <div className="lg:col-span-4 lg:mr-[15px]">
                <div className="flex flex-wrap items-center justify-between gap-y-2 py-4">
                    <div className="mr-[10px] rounded-full bg-success-soft px-2.5 py-1 ">
                        <p className="trancate items-center text-xs text-success-text">
                            {LN("liveMatch")} {roomName ?? '—'}
                        </p>
                    </div>

                    <div className="flex gap-[18px] text-xs text-text-secondary">
                        <div>
                            <p className="text-lg font-medium text-text-primary">{formatTime(elapsedSeconds)}</p>
                            {LN("time")}
                        </div>
                        <div>
                            <p className="text-lg font-medium text-text-primary">{players.length}</p>
                            {LN("players")}
                        </div>
                        <div>
                            <p className="text-lg font-medium text-text-primary">{myScore}</p>
                            {LN("yourScore")}
                        </div>
                    </div>
                </div>

                <div id="canvas-container" className="h-[60vh] sm:h-[65vh] lg:col-span-4 lg:h-[calc(100vh-250px)] flex items-center justify-center overflow-hidden">
                    {/* The playfield grid is square, so the board is a centered square that
                        fills the available area (max-width tracks the container height for
                        each breakpoint). This keeps the board exactly the canvas size from
                        the countdown onward, with no game-field colour bleeding past it. */}
                    <div
                        id="game-board"
                        className="relative flex flex-col items-center justify-center overflow-hidden bg-game-field rounded-xl aspect-square w-full max-w-[60vh] sm:max-w-[65vh] lg:max-w-[calc(100vh-250px)]"
                    >
                        {roomStatus === 'READY' && (
                            <div className="flex flex-col items-center gap-3 text-text-tertiary">
                                <span>{LN("startAfter")}</span>
                                <h2>{secondsLeft}</h2>
                            </div>
                        )}

                        {
                            (roomStatus === 'PLAYING' || roomStatus === 'running')  && (
                                <GameCanvas
                                    setGameDir={setGameDir}
                                    control={control}
                                />
                        )}

                        {(showOver || showWin) && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center  bg-bg-overlay rounded-xl">
                                <h2 className={`text-3xl font-bold mb-4 ${showWin ? '!text-success' : '!text-danger'}`}>
                                    {showWin ? LN("win") : LN("gameOver")}
                                </h2>
                                <button
                                    onClick={handleRestart}
                                    className="cursor-pointer rounded-lg bg-accent px-4 py-2 font-semibold text-text-inverse transition-colors duration-200 hover:bg-accent-hover active:bg-accent-active"
                                >
                                    {LN("tryAgain")}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between py-4">
                    <div className="flex gap-1.5">
                        <Kbd active={gameStatus === 'START'}>{LN("move")}</Kbd>
                        <Kbd active={gameDir === 'LEFT'} activeClass="text-warning-text">←</Kbd>
                        <Kbd active={gameDir === 'UP'} activeClass="text-warning-text">↑</Kbd>
                        <Kbd active={gameDir === 'DOWN'} activeClass="text-warning-text">↓</Kbd>
                        <Kbd active={gameDir === 'RIGHT'} activeClass="text-warning-text">→</Kbd>
                    </div>
                </div>
            </div>

            <aside className="mt-4 lg:col-span-1 lg:mt-0 lg:h-[calc(100vh-150px)] border-t lg:border-l lg:border-t-0 border-border-default p-4 text-text-primary">
                <div className="rounded-[10px] bg-info-soft px-3 py-2.5">
                    <div className="flex items-center gap-2 text-xs text-info-text">
                        <UserRound className="h-3.5 w-3.5" aria-hidden="true" /> {LN("yourPosition")}
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-xl font-medium text-info-text">{ordinalPos}</span>
                        <span className="text-xs text-info-text">{LN("of")} {players.length}</span>
                    </div>
                </div>

                <div className="mt-3.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium lowercase tracking-wide text-text-secondary">{LN("players")}</span>
                        <span className="text-xs text-text-tertiary">{players.length}</span>
                    </div>
                    <ul>
                        {sortedPlayers.map((it, idx) => {
                            const me = it.id === id;

                            return (
                                <li
                                    key={it.id}
                                    className={`flex items-center gap-2 rounded-[10px] px-1 py-1.5 text-xs ${me ? "bg-bg-muted font-medium text-text-primary" : ""}`}
                                >
                                    <span className="w-[18px] text-right tabular-nums text-text-tertiary">{idx + 1}</span>
                                    <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: it.color }}></span>
                                    <span className="min-w-0 flex-1 truncate">{it.username}</span>
                                    <span className="tabular-nums text-text-secondary">{it.score}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="my-0.5 h-px bg-border-default"></div>
            </aside>
        </div>
    );
}

export default ArenaContent;
