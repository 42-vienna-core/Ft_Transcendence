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
import { useNotificationListener } from "../store/notification";
import { useRoomDataBySocket } from "../store/useRoomData";

function normalizeRoomStatus(raw: RoomStatusType | undefined): RoomStatusType | 'UNKNOWN'{
    if (!raw) return 'UNKNOWN';
    const s = raw.toUpperCase();
    if (s === 'COUNTDOWN') return 'COUNTDOWN';
    if (s === 'WAITING') return 'WAITING';
    if (s === 'ABANDONED') return 'ABANDONED';
    if (s === 'READY' || s === 'RUNNING' || s === 'PLAYING' || s === 'STARTED') return 'READY';
    return 'UNKNOWN';
}

export function getOrdinal(num: number): string {
  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) {
    return num + "st";
  }
  if (j === 2 && k !== 12) {
    return num + "nd";
  }
  if (j === 3 && k !== 13) {
    return num + "rd";
  }

  return num + "th";
}

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
    const [ gameState, setGameState ] = useState<GameState | null>(null);
    const [ gameDir, setGameDir ] = useState<Direction | null>(null);
    const [ control, setControl ] = useState<ControlType>('arrow');
    // const [ roomState, setRoomState ] = useState<RoomData | null>(null);
    const [ tick, setTick ] = useState<number>(0);

    const { isConnected, socket } = useGameSocket();
    const { gameMode } = useGameMode();
    const router = useRouter();


    const players = usePlayerStore((state) => state.players);
    const setPlayers = usePlayerStore((state) => state.setPlayers);
    const resetPlayers = usePlayerStore((state) => state.resetPlayers);

    const joinedSocketRef = useRef<Socket | null>(null);
    const r = useRef<boolean>(false);
    const { id } = useProfile();
    const {friendId, roomId} = useFriendAndRoomID();
    const {roomData: roomState, countdownData, roomStatus} = useRoomDataBySocket();

    const initCountDown = countdownData ? countdownData.countdown : 3;
    const [secondsLeft, setSecondsLeft] = useState(initCountDown);

    useEffect(() => {
        if (roomState === null) {
            router.replace('/');
        } else {
            r.current = true;
        }

        setSecondsLeft(initCountDown);
        const interval = setInterval(() => {
            setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            clearInterval(interval);
            // clearGameData();
        };
    }, [roomState, countdownData]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleGameState = (data: Game) => {
            console.log("game-state", data);
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
    }, [socket, isConnected, setPlayers, router, roomStatus]);

    if (r.current === false) return null;

    const status = normalizeRoomStatus(roomState?.roomStatus);
    if (roomState && status === 'UNKNOWN') {
        console.warn(
            `Unknown roomStatus "${roomState.roomStatus}" — GameCanvas will not mount. ` +
            `Add it to normalizeRoomStatus().`
        );
    }

    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const myScore = players.find(it => it.id === id)?.score ?? 0;
    const myIndex = sortedPlayers.findIndex(it => it.id === id);
    const ordinalPos = getOrdinal(myIndex + 1);
    const elapsedSeconds = Math.floor((tick * TICK_MS) / 1000);

    const maxLenRoomId = 10;
    const roomName = roomState && roomState.roomId.length > maxLenRoomId ?
        roomState.roomId.slice(0, maxLenRoomId):
        roomState?.roomId;

    console.log("STATUS: ===>> ", roomStatus);
    // console.log("secondsLeft: ===>> ",secondsLeft);

    return (
        <div className="grid grid-cols-5 w-full">
            <div className="col-span-4 mr-[15px]">
                <div className="flex items-center justify-between py-4">
                    <div className="mr-[10px] rounded-full bg-success-soft px-2.5 py-1 ">
                        <p className="trancate items-center text-xs text-success-text">
                            live match · room {roomName ?? '—'}
                        </p>
                    </div>
                    
                    <div className="flex gap-[18px] text-xs text-text-secondary">
                        <div>
                            <p className="text-lg font-medium text-text-primary">{formatTime(elapsedSeconds)}</p>
                            time
                        </div>
                        <div>
                            <p className="text-lg font-medium text-text-primary">{players.length}</p>
                            players
                        </div>
                        <div>
                            <p className="text-lg font-medium text-text-primary">{myScore}</p>
                            your score
                        </div>
                    </div>
                </div>

                <div id="canvas-container" className="col-span-4 h-[calc(100vh-250px)] flex flex-col items-center justify-center overflow-hidden bg-game-field rounded-xl">
                    {roomStatus === 'READY' && (
                        <div className="flex flex-col items-center gap-3 text-text-tertiary">
                            <span>Game will start after</span>
                            <h2>{secondsLeft}</h2>
                        </div>
                    )}

                    {roomStatus === 'PLAYING' && (
                        <GameCanvas
                            setGameState={setGameState}
                            setGameDir={setGameDir}
                            control={control}
                        />
                    )}

                    {status === 'UNKNOWN' && roomState && (
                        <div className="text-danger text-sm text-center px-4">
                            Unexpected room status: <code>{roomState.roomStatus}</code>
                            <br />Add it to <code>normalizeRoomStatus()</code>.
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between py-4">
                    <div className="flex gap-1.5">
                        <Kbd active={gameState === 'START'}>move</Kbd>
                        <Kbd active={gameDir === 'LEFT'} activeClass="text-warning-text">←</Kbd>
                        <Kbd active={gameDir === 'UP'} activeClass="text-warning-text">↑</Kbd>
                        <Kbd active={gameDir === 'DOWN'} activeClass="text-warning-text">↓</Kbd>
                        <Kbd active={gameDir === 'RIGHT'} activeClass="text-warning-text">→</Kbd>
                    </div>
                </div>
            </div>

            <aside className="col-span-1 h-[calc(100vh-150px)] border-l border-border-default p-4 text-text-primary">
                <div className="rounded-[10px] bg-info-soft px-3 py-2.5">
                    <div className="flex items-center gap-2 text-xs text-info-text">
                        <UserRound className="h-3.5 w-3.5" aria-hidden="true" /> your position
                    </div>
                    <div className="mt-1 flex items-baseline gap-1.5">
                        <span className="text-xl font-medium text-info-text">{ordinalPos}</span>
                        <span className="text-xs text-info-text">of {players.length}</span>
                    </div>
                </div>

                <div className="mt-3.5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium lowercase tracking-wide text-text-secondary">players</span>
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
