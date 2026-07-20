'use client'

import { useUserStore } from "@/components/store/useUserStore"
import { useGameSocket } from "@/providers/SocketProvider";
import { useState, useEffect, useRef, Dispatch, SetStateAction } from "react";
import { Globe, Cpu, UserRoundPlus, Loader2, Loader } from "lucide-react";
import style from "./arena-content.module.css"
import GameCanvas from "./game/game-canvas";
import { Socket } from "socket.io-client";

interface OnlineUsersType {
	id: number;
	username: string;
    avatar: string | null;
	role: string;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface RoomStateType  {
	players: number;
	roomId: string;
	roomStatus: string;
};

interface Position {
	x: number;
	y: number;
}

interface Snake {
	id: number; //user id
	body: Position[]; //first position 
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

type DIR = 'U' | 'D' | 'L' | 'R' | null;
type GameState = 'START' | 'PAUSE' | 'END' | 'WIN' | 'OVER' | null;


function ArenaContent() {

    const [gameState, setGameState] = useState<GameState | null>(null);
    const [gameDir, setGameDir] = useState<DIR | null>(null);
    const {isConnected, socket} = useGameSocket();

	const [roomState, setRoomState] = useState<RoomStateType>();
    const socketRef = useRef<Socket | null>(socket);

	const onlineUsers = useUserStore((state) => state.onlineUsers);
    const setOnlineUsers = useUserStore((state) => state.setOnlineUsers);

	useEffect(() => {
		if (!socket || !isConnected) {
			return;
		} ;
		
		const handleGameState = (data: Game) => {
			console.log("game state", data);
			// setServerGame(data);
		}

		const handleOnlineUsers = (data: OnlineUsersType[]) => { 
            console.log("online users", data);
            setOnlineUsers(data);
        };

		const handleRoomUpdate = (data: RoomStateType) => { 
            console.log("room data", data);
            setRoomState({...data});
        }

        socket.on("online-users", handleOnlineUsers);  
        socket.on("room-update", handleRoomUpdate);
		socket.on("game-state", handleGameState);

        socket.emit("join-match", { mode: 'CPU' });


		socket.emit("get-online-users");

		return () => {
			socket.off("online-users",  handleOnlineUsers);
    		socket.off("room-update", handleRoomUpdate);
			socket.off("game-state", handleGameState);
            // socket.emit("leave-room");
		}
	},[socket, isConnected, setOnlineUsers]);
    console.log("FRIEND'S LIST: ", onlineUsers);
    console.log("ROOM status: ", roomState);

    // =========================================================
    return (
        <div className="grid grid-cols-5 w-full">    
            <div id="canvas-container" className="col-span-4 mr-[15px]">
                <div className={`${style.boardTop} py-4`}>
                    <span className={style.boardTag}><i className={`${style.ti} ${style.tiCircleFilled} font-size:8px;`}  aria-hidden="true"></i> live match · room 47</span>
                    <div className={style.boardStats}>
                        <div className="text-white"><p >00:42</p>time</div>
                        <div className="text-white"><p>12</p>players</div>
                        <div className="text-white"><p>340</p>your score</div>
                    </div>
                </div>

                <div className="col-span-4 h-[calc(100vh-250px)] flex flex-col items-center justify-center bg-gray-900 rounded-xl ">
                    {
                        roomState?.roomStatus === 'WAITING' &&
                            <Loader className="text-center w-15 h-15 animate-spin"/>
                    }
                    {
                        roomState?.roomStatus === 'READY' &&
                            <GameCanvas
								//game={serverGame}
                                setGameState={setGameState}
                                setGameDir={setGameDir}
                            />
                    }
                </div>

                <div className={`${style.boardBottom}  py-4`}>
                    <div> 
                        <span className={`${style.kbd} ${gameState === 'START' && "text-[var(--color-accent-text)]"}`}>move</span> 
                        <span className={`${style.kbd} ${gameDir === 'L' && "text-[var(--color-warning-text)]"}`}>←</span> 
                        <span className={`${style.kbd} ${gameDir === 'U' && "text-[var(--color-warning-text)]"}`}>↑</span> 
                        <span className={`${style.kbd} ${gameDir === 'D' && "text-[var(--color-warning-text)]"}`}>↓</span> 
                        <span className={`${style.kbd} ${gameDir === 'R' && "text-[var(--color-warning-text)]"}`}>→</span>
                        <span className={`${style.kbd} ${gameState === 'PAUSE' && "text-[var(--color-accent-text)]"}`}>pause</span> 
                    </div>
                    <div>tick 60 fps · ping 24 ms </div>
                </div>
                
            </div>

            <aside className="col-span-1 h-[calc(100vh-150px)] border-l border-gray-700 p-4 text-white">
                <div className={style.youCard}>
                    <div className={style.row1}><i className={`${style.ti} ${style.tiUser} font-size:14px;`} aria-hidden="true" ></i> your position</div>
                    <div className={style.row2}>
                        <span className={`${style.score} font-size:13px;`}>3<span>rd</span></span>
                        <span className={style.rank}>of 12</span>
                    </div>
                </div>

                <div>
                    <div className={style.sideHead}>
                        <span className={style.sideTitle}>players</span>
                        <span className={style.sideCount}>12 live</span>
                    </div>
                    <div className={style.playerRow}><span className={`${style.pos} `}>1</span><span className={`${style.swatch} bg-blue-500`}></span><span className={style.name}>Mira</span><span className={style.pts}>920</span></div>
                    <div className={style.playerRow}><span className={`${style.pos} `}>2</span><span className={`${style.swatch} bg-red-500`}></span><span className={style.name}>Kostia</span><span className={style.pts}>615</span></div>
                    <div className={`${style.playerRow} ${style.me}`}><span className={style.pos}>3</span><span className={`${style.swatch} bg-orange-500`}></span><span className={style.name}>you</span><span className={style.pts}>340</span></div>
                    <div className={style.playerRow}><span className={`${style.pos} `}>4</span><span className={`${style.swatch} bg-yellow-500`}></span><span className={style.name}>Lila</span><span className={style.pts}>298</span></div>
                    <div className={style.playerRow}><span className={`${style.pos} `}>5</span><span className={`${style.swatch} bg-pink-500`}></span><span className={style.name}>Jonas</span><span className={style.pts}>214</span></div>
                    <div className={style.playerRow}><span className={`${style.pos} `}>6</span><span className={`${style.swatch} bg-green-500`}></span><span className={style.name}>noor_27</span><span className={style.pts}>180</span></div>
                    <div className={style.playerRow}><span className={`${style.pos} `}>7</span><span className={`${style.swatch} bg-gray-500`}></span><span className={style.name}>tomato</span><span className={style.pts}>155</span></div>
                </div>

                <div className={style.divider}></div>

                <div className={style.ratingCard}>
                    <div className={`${style.label} `}>your rating</div>
                    <div className={style.value}><span className="v">1 482</span><span className="delta">+14 today</span></div>
                </div>

                <div className={style.ratingCard}>
                    <div className={style.value}>best score</div>
                    <div className={style.value}><span className={style.v}>1 207</span><span className="font-size:11px; color: var(--color-text-tertiary);">last week</span></div>
                </div>
            </aside>
        </div>
    )
}

export default ArenaContent;