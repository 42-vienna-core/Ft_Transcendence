"use client"
import { useCallback ,useEffect , useRef, useState} from 'react';
import {io, Socket } from "socket.io-client"
import "@/src/styles/dashboard.css";
import { useAuth } from "@/src/components/provider/UserProvider"
import { OnlieList } from '@/src/types/Types';

export default function Dashboard () {

	const {cntUser, refreshUser} = useAuth();

	const socketRef = useRef<Socket | null>(null);
	const [players, setPlayers] = useState(0);


	const [onlineUsers, setOnlineUsers] = useState<OnlieList[]>([]);

	const handleOnline = useCallback(( onlieUsers : OnlieList[] ) => {
		setOnlineUsers(onlieUsers);
	}, []);

	const handleOffline = useCallback(( { userId } : { userId: number } ) => {
		setOnlineUsers( (prev) => prev.filter((item) => item?.userId !== userId));
	},[])

	useEffect( ()  => {
		refreshUser();
		
		socketRef.current = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`,{
			withCredentials: true,
		});

		socketRef.current.on("connect", () => {		
			console.log("✅ Socket connected!", socketRef.current?.id);
		});
	
		socketRef.current.on("online-users", ( onlieUsers : OnlieList[] )  => {
			setOnlineUsers(onlieUsers);
		});

		socketRef.current.on("room-update", (data) => {
			setPlayers(data.players);
			console.log("players:", data.players);
		})

		socketRef.current.on("game-start", () => console.log("Start Game") );
		socketRef.current.on("user-online", handleOnline);
		socketRef.current.on("user-offline", handleOffline);

		return () => { 
			socketRef.current?.off("user-online", handleOnline);
			socketRef.current?.off("user-offline",  handleOffline);
			socketRef.current?.disconnect();
		}
	}, [handleOnline, handleOffline]);

	console.log(onlineUsers)
	
	return (

	<div className=" bg text-white border rounded-2xl">

	<section className="mockBoard" aria-label="Snake game field ">

		<div className="flex flex-row md:flex-row md:items-center justify-between gap-2 md:gap-0 h-auto md:h-14 px-4 py-2">

		<div className="flex items-center gap-2 text-sm md:text-base font-medium ">
			live match · Room 
		</div>

		<div className="flex flex-col md:flex-row items-center justify-between w-full gap-1 md:gap-0 text-sm md:text-base">

			<div className="text-white md:w-1/3 text-center md:text-left">
			00:42 time
			</div>

			<div className="md:w-1/3 text-center font-medium">
			Players {players} / 4
			</div>

			<div className="text-white md:w-1/3 text-center md:text-right"> 340 your score </div>

		</div>
	</div>

		<canvas className='playArea '> 
		
		</canvas>

	<div>
	</div>
		<div className="boardBottom">
		<div>move 
			<span className="kbd">←</span> 
			<span className="kbd">↑</span> 
			<span className="kbd">↓</span> 
			<span className="kbd">→</span>{"\u00A0"}boost
		<span className="kbd">space</span>{"\u00A0"}pause
			<span className="kbd">esc</span>
		</div>
		<div>tick 60 fps · ping 24 ms</div>
		</div>
	</section>

	<aside className="mockSide" aria-label="Match sidebar ">
		<div className="youCard">
		<div className="row1">
			<i className="ri tiUser aria-hidden:true"></i> 
			your position
		</div>
		<div className="row2">
			<span className="score">3<span>
			rd
			</span></span>
			<span className="rank">of 12</span>
		</div>
		</div>

		<div>
			{onlineUsers.length && 
				onlineUsers.map((obj,index) => {
					return (
						<div key={index} className="playerRow" >
							
							<span className="swatch bg-green-500"></span>
							<span className="name">{obj.userId === cntUser?.id ? "You " : obj.Username}</span>
							<span className="pts">{555}</span>
						</div>
					)
				})
			}
		</div>
		

		<div className="divider"></div>

		<div className="ratingCard">
		<div className="label">your rating</div>
		<div className="value">
			<span className="v">1 482</span>
			<span className="delta">+14 today</span>
		</div>
		</div>
	</aside>
	</div>

	);
}