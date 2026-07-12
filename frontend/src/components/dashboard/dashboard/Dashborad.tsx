"use client"
import "@/src/styles/dashboard.css";
import { useRef,  useEffect, useState} from 'react';
import { OnlineUsersType, RoomStateType } from '@/src/types/Types';
import { Socket } from "socket.io-client";
import Settings from './Settings';
import Game from "./Game"
import { useSocket } from "../../socket/socket";
import { useUserStore } from "@/src/components/store/useUserStore"
import OnlineUser from "./OnlineUser";

export default function Dashboard () {
	
	const [gamestart, setGameStart] = useState(false);
	const [roomState, setRoomState] = useState<RoomStateType>();
	const socketRef = useRef<Socket | null>(useSocket());

	const onlineUsers = useUserStore((state) => state.onlineUsers);

	useEffect(() => {
		if (!socketRef.current) return ;

		const handleOnlineUsers = (data: OnlineUsersType) => { useUserStore.setState({ onlineUsers: data }) };
		const handleRoomUpdata = (data: RoomStateType) => {
			if (data.players > 7)
				setGameStart(true);
			else
				setGameStart(false);
			setRoomState({...data});
		}
		socketRef.current.on("online-users",  handleOnlineUsers);
		socketRef.current.on("room-update", handleRoomUpdata);

		socketRef.current.emit("get-online-users", () => {console.log("get-online-users was caled in dashboard")});
		socketRef.current.emit("join-room", async () => {console.log("join-room was caled in dashboard")});

		return () => {
			if (!socketRef.current) return ;
			socketRef.current.off("online-users", handleOnlineUsers);
    		socketRef.current.off("room-update", handleRoomUpdata);
			socketRef.current.emit("leave-room");
		}
	},[])

	return ( 
	<>
		{ gamestart ? ( <Game /> )
		: (
			<div className=" bg text-white border rounded-2xl h-screen">

				<Settings roomState={roomState} />
				<aside className="mockSide" aria-label="Match sidebar ">
					<div>
						{
							onlineUsers.length && 
								onlineUsers.map((obj : OnlineUsersType) => (
								<div key={obj.id} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-center rounded-lg px-4 py-3 text-sm mb-2 border ">
									<OnlineUser obj={obj}/>
								</div>
							))
						}
					</div>		
				</aside>

			</div>
		)
		}
	</>)
}