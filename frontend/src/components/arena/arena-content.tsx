'use client'
//import { useUserStore } from "@/components/store/useUserStore"
import { useGameSocket } from "@/providers/SocketProvider";
import { useState, useEffect, useRef } from "react";
import style from "./arena-content.module.css"
import GameCanvas from "./game/game-canvas";
import { Socket } from "socket.io-client";
import { RmOptions } from "fs";
import { constants } from "buffer";

interface OnlineUsersType {
	id: number;
	username: string;
    avatar: string | null;
	role: string;
}

interface RoomStateType  {
	players: number;
	roomId: string;
	roomStatus: string;
};

type DIR = 'U' | 'D' | 'L' | 'R' | null;
type GameState = 'START' | 'PAUSE' | 'END' | 'WIN' | 'OVER' | null;


function ArenaContent() {

    const [gameState, setGameState] = useState<GameState | null>(null);
    const [gameDir, setGameDir] = useState<DIR | null>(null);
    const {isConnected, socket} = useGameSocket();


    // I add this to chaeck if the socket works in this component 
	const [roomState, setRoomState] = useState<RoomStateType>();
    const socketRef = useRef<Socket | null>(socket);

	//const onlineUsers = useUserStore((state) => state.onlineUsers);z

	useEffect(() => {
		if (!socketRef.current) return ;

		// const handleOnlineUsers = (data: OnlineUsersType) => { useUserStore.setState({ onlineUsers: data }) };
		// const handleRoomUpdata = (data: RoomStateType) => { setRoomState({...data}) }

		socketRef.current.on("online-users",  (data: OnlineUsersType) => console.log("online users",data)); 
        //  if you know where use this state do this > socketRef.current.on("online-users", handleOnlineUsers );  
		socketRef.current.on("room-update", ( data: RoomStateType) => console.log("room data ",data));
        //  if you know where use this state do this > socketRef.current.on("room-update", handleRoomUpdata );
        // and do the same in unmount 

		socketRef.current.emit("get-online-users");
		//socketRef.current.emit("join-room");

		return () => {
			if (!socketRef.current) return ;
			socketRef.current.off("online-users", (data: OnlineUsersType) => console.log(data) );
    		socketRef.current.off("room-update", (data: RoomStateType) => console.log(data));
			socketRef.current.emit("leave-room");
		}
	},[])
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
                    <GameCanvas
                        setGameState={setGameState}
                        setGameDir={setGameDir}
                    />
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