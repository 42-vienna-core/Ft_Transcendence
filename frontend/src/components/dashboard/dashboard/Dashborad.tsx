"use client"
import { useCallback ,useEffect , useRef, useState} from 'react';
import {io, Socket } from "socket.io-client"
import "@/src/styles/dashboard.css";
import { useAuth } from "@/src/components/provider/UserProvider"
import { OnlieList } from '@/src/types/Types';
import Settings from './Settings';
import Game from "./Game"
import { PlayerRoomData } from "@/src/types/Types";


export default function Dashboard () {

	const {cntUser, refreshUser} = useAuth();
	const [gamestart, setGameStart] = useState(false);

	const socketRef = useRef<Socket | null>(null);
	const [playersData, setPlayersData] = useState<PlayerRoomData>();

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
			console.log(data)
			setPlayersData({...data});
			if (data.players > 1)
			{
				setTimeout(() => {setGameStart(true)},1000);
				console.log("if block", gamestart)
			}
			else
				setGameStart(false);
		})

		socketRef.current.on("game-start", () => console.log("Start Game") );
		socketRef.current.on("user-online",  handleOnline);
		socketRef.current.on("user-offline", handleOffline);

		return () => {
			socketRef.current?.off("user-online",  handleOnline);
			socketRef.current?.off("user-offline", handleOffline);
			socketRef.current?.disconnect();
		}
	}, []);
	
	return ( 
	<>
		{ gamestart ? ( <Game /> )
		: (
			<div className=" bg text-white border rounded-2xl h-screen">

				<Settings playersData={playersData} />
				<aside className="mockSide" aria-label="Match sidebar ">
					<div>
						{onlineUsers.length && 
							onlineUsers.map((obj) => {
								return (
									<div key={obj.userId} className="playerRow" >
										
										<span className="swatch bg-green-500"></span>
										<span className="name">{obj.userId === cntUser?.id ? "You " : obj.Username}</span>
										<span className="pts">{555}</span>
									</div>
								)
							})
						}
					</div>		
				</aside>

			</div>
		)
		}
	</>)
}