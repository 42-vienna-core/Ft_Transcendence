'use client'

import { useGameMode, useUserStore } from "@/components/store/useUserStore"
import { useGameSocket } from "@/providers/SocketProvider";
import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import type { Socket } from "socket.io-client";
import { Globe, Cpu, UserRoundPlus, Loader2, Loader } from "lucide-react";
import style from "./arena-content.module.css"
import GameCanvas from "./game/game-canvas";

interface OnlineUsersType {
    id: number;
    username: string;
    avatar: string | null;
    role: string;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | null;

interface RoomStateType {
    players: number;
    roomId: string;
    roomStatus: string;
}

interface Position {
    x: number;
    y: number;
}

interface Snake {
    id: number;
    body: Position[];
    direction: Direction;
    newDirection: Direction | null;
    newPosition: Position | null;
    willGrow: boolean;
    alive: boolean;
    score: number;
    color: string;
    player: 'human' | 'bot';
}

interface Food {
    position: Position;
    eaten: boolean;
}

export interface Game {
    roomId: string;
    snakes: Snake[];
    food: Food[];
    status: 'waiting' | 'running' | 'finished';
    tick: number;
    gridWidth: number;
    gridHeight: number;
    winnerId: number | null;
    botPresent: boolean;
}

type GameState = 'START' | 'PAUSE' | 'END' | 'WIN' | 'OVER' | null;

function normalizeRoomStatus(raw: string | undefined): 'WAITING' | 'READY' | 'UNKNOWN' {
    if (!raw) return 'UNKNOWN';
    const s = raw.toUpperCase();
    if (s === 'WAITING' || s === 'PENDING' || s === 'LOBBY') return 'WAITING';
    if (s === 'READY' || s === 'RUNNING' || s === 'PLAYING' || s === 'STARTED') return 'READY';
    return 'UNKNOWN';
}

function ArenaContent() {
    const [ gameState, setGameState ] = useState<GameState | null>(null);
    const [ gameDir, setGameDir ] = useState<Direction | null>(null);
    const { isConnected, socket } = useGameSocket();
    const { gameMode } = useGameMode();

    const [roomState, setRoomState] = useState<RoomStateType>();

    const onlineUsers = useUserStore((state) => state.onlineUsers);
    const setOnlineUsers = useUserStore((state) => state.setOnlineUsers);

    const joinedSocketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!socket || !isConnected || !gameMode) return;

        const handleOnlineUsers = (data: OnlineUsersType[]) => {
            console.log("online users", data);
            setOnlineUsers(data);
        };

        const handleRoomUpdate = (data: RoomStateType) => {
            console.log("room data", data, "→ normalized:", normalizeRoomStatus(data.roomStatus));
            setRoomState({ ...data });
        };

        socket.on("online-users", handleOnlineUsers);
        socket.on("room-update", handleRoomUpdate);

        if (joinedSocketRef.current !== socket) {
            joinedSocketRef.current = socket;
            socket.emit("join-match", { mode: gameMode });
        }
        
        socket.emit("get-online-users");

        return () => {
            socket.off("online-users", handleOnlineUsers);
            socket.off("room-update", handleRoomUpdate);
        };
    }, [socket, isConnected, gameMode, setOnlineUsers]);

    const status = normalizeRoomStatus(roomState?.roomStatus);

    if (roomState && status === 'UNKNOWN') {
        console.warn(
            `Unknown roomStatus "${roomState.roomStatus}" — GameCanvas will not mount. ` +
            `Add it to normalizeRoomStatus().`
        );
    }

    return (
        <div className="grid grid-cols-5 w-full">
            <div id="canvas-container" className="col-span-4 mr-[15px]">
                <div className={`${style.boardTop} py-4`}>
                    <span className={style.boardTag}>
                        <i className={`${style.ti} ${style.tiCircleFilled}`} aria-hidden="true"></i> live match · room {roomState?.roomId ?? '—'}
                    </span>
                    <div className={style.boardStats}>
                        <div className="text-white"><p>00:42</p>time</div>
                        <div className="text-white"><p>{roomState?.players ?? 0}</p>players</div>
                        <div className="text-white"><p>340</p>your score</div>
                    </div>
                </div>

                <div className="col-span-4 h-[calc(100vh-250px)] flex flex-col items-center justify-center bg-gray-900 rounded-xl">
                    {status === 'WAITING' && (
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                            <Loader className="w-15 h-15 animate-spin" />
                            <span>waiting for players…</span>
                        </div>
                    )}

                    {status === 'READY' && (
                        <GameCanvas
                            setGameState={setGameState}
                            setGameDir={setGameDir}
                        />
                    )}

                    {!roomState && (
                        <div className="flex flex-col items-center gap-3 text-gray-400">
                            <Loader className="w-15 h-15 animate-spin" />
                            <span>joining match…</span>
                        </div>
                    )}

                    {status === 'UNKNOWN' && roomState && (
                        <div className="text-red-400 text-sm text-center px-4">
                            Unexpected room status: <code>{roomState.roomStatus}</code>
                            <br />Add it to <code>normalizeRoomStatus()</code>.
                        </div>
                    )}
                </div>

                <div className={`${style.boardBottom} py-4`}>
                    <div>
                        <span className={`${style.kbd} ${gameState === 'START' ? "text-[var(--color-accent-text)]" : ""}`}>move</span>
                        <span className={`${style.kbd} ${gameDir === 'LEFT' ? "text-[var(--color-warning-text)]" : ""}`}>←</span>
                        <span className={`${style.kbd} ${gameDir === 'UP' ? "text-[var(--color-warning-text)]" : ""}`}>↑</span>
                        <span className={`${style.kbd} ${gameDir === 'DOWN' ? "text-[var(--color-warning-text)]" : ""}`}>↓</span>
                        <span className={`${style.kbd} ${gameDir === 'RIGHT' ? "text-[var(--color-warning-text)]" : ""}`}>→</span>
                        <span className={`${style.kbd} ${gameState === 'PAUSE' ? "text-[var(--color-accent-text)]" : ""}`}>pause</span>
                    </div>
                    <div>tick 60 fps · ping 24 ms</div>
                </div>
            </div>

            <aside className="col-span-1 h-[calc(100vh-150px)] border-l border-gray-700 p-4 text-white">
                <div className={style.youCard}>
                    <div className={style.row1}><i className={`${style.ti} ${style.tiUser}`} aria-hidden="true"></i> your position</div>
                    <div className={style.row2}>
                        <span className={style.score}>3<span>rd</span></span>
                        <span className={style.rank}>of 12</span>
                    </div>
                </div>

                <div>
                    <div className={style.sideHead}>
                        <span className={style.sideTitle}>players</span>
                        <span className={style.sideCount}>12 live</span>
                    </div>
                    <div className={style.playerRow}><span className={style.pos}>1</span><span className={`${style.swatch} bg-blue-500`}></span><span className={style.name}>Mira</span><span className={style.pts}>920</span></div>
                    <div className={style.playerRow}><span className={style.pos}>2</span><span className={`${style.swatch} bg-red-500`}></span><span className={style.name}>Kostia</span><span className={style.pts}>615</span></div>
                    <div className={`${style.playerRow} ${style.me}`}><span className={style.pos}>3</span><span className={`${style.swatch} bg-orange-500`}></span><span className={style.name}>you</span><span className={style.pts}>340</span></div>
                    <div className={style.playerRow}><span className={style.pos}>4</span><span className={`${style.swatch} bg-yellow-500`}></span><span className={style.name}>Lila</span><span className={style.pts}>298</span></div>
                    <div className={style.playerRow}><span className={style.pos}>5</span><span className={`${style.swatch} bg-pink-500`}></span><span className={style.name}>Jonas</span><span className={style.pts}>214</span></div>
                    <div className={style.playerRow}><span className={style.pos}>6</span><span className={`${style.swatch} bg-green-500`}></span><span className={style.name}>noor_27</span><span className={style.pts}>180</span></div>
                    <div className={style.playerRow}><span className={style.pos}>7</span><span className={`${style.swatch} bg-gray-500`}></span><span className={style.name}>tomato</span><span className={style.pts}>155</span></div>
                </div>

                <div className={style.divider}></div>

                <div className={style.ratingCard}>
                    <div className={style.label}>your rating</div>
                    <div className={style.value}><span className={style.v}>1 482</span><span className="delta">+14 today</span></div>
                </div>

                <div className={style.ratingCard}>
                    <div className={style.value}>best score</div>
                    <div className={style.value}><span className={style.v}>1 207</span><span>last week</span></div>
                </div>
            </aside>
        </div>
    );
}

export default ArenaContent;