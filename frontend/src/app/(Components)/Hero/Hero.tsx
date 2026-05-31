"use client"

import Link from 'next/link';
import style from "../../styles";
import {useState, useEffect , useRef} from 'react';
import Api from "../../api"
import {io, Socket } from "socket.io-client"

export default  function  Hero({userId}: {userId: number}) {

    // const canvasRef = useRef<HTMLCanvasElement>(null);

    const [rooms, setRooms] = useState<any>([]);
    const socketRef = useRef<Socket | null>(null);

    useEffect( ()  => {

        socketRef.current = io("http://localhost:2000/");

        socketRef.current.on("connect", () => {
            console.log("✅ Socket connected!", socketRef.current?.id);
        });

        socketRef.current.on("room-update", (data) => {
            console.log("players:", data.players);
        })

        socketRef.current.on("gmae-start", () => {
            console.log("Start Game");
        })

        let res;
        (async () => {
            res = await Api.getRequest("http://localhost:4000/api/room");
            if (res.length === 0)
            {
                res = await Api.postRequest("http://localhost:4000/api/room", {
                    name: "Room",
                    maxUsers: 4,
                    type: "PUBLIC"
                })
            }
            
            console.log(res);
            setRooms(res.map((item: any) => {return {...item, Players: 0}}));
        })();
        return () => {
            socketRef.current?.disconnect();
        }
    }, []);

   

    // useEffect(() => {

    //     const canvas = canvasRef.current;
    //     const cont = canvas?.getContext('2d');

    //     if (!canvas || !cont) return;

    //      if (!cordinates.start) 
    //        return cont.clearRect(0, 0, canvas.width, canvas.height);

    //     cont.fillStyle = "red";

    //     function drow () : void {
    //         if (!canvas || !cont) return;
    //         cont.clearRect(0, 0, canvas.width, canvas.height);
    //         cont.fillRect(cordinates.x, cordinates.y, cordinates.w, cordinates.h);
    //     }

    //     function handleKeyDown (e: KeyboardEvent) : void {
    //          if (!canvas || !cont) return;
    //         e.preventDefault();
    //         if (e.key === "ArrowRight") {
    //             if(cordinates.x + 10 + cordinates.w > canvas?.width) return;
    //             setCordinates({...cordinates, x: cordinates.x + 10});
    //         }
    //         if (e.key === "ArrowLeft") {
    //             if(cordinates.x - 10 < 0) return;
    //             setCordinates({...cordinates, x: cordinates.x - 10})
    //         }

    //         if (e.key === "ArrowUp") {
    //             if(cordinates.y - 10 < 0) return;
    //             setCordinates({...cordinates, y: cordinates.y - 10})
    //         }

    //         if (e.key === "ArrowDown")
    //         {
    //             if(cordinates.y + 10 + cordinates.h > 400) return;
    //             setCordinates({...cordinates, y: cordinates.y + 10})
    //         }
    //         drow();
    //     }
        
    //     drow();
    //     window.addEventListener("keydown", handleKeyDown);
    //     return () => {
    //         window.removeEventListener("keydown", handleKeyDown);
    //     }
    // }, [cordinates])

    return (
        <div className={`${style.hero.hero} bg`}>

            <h1 className="font-bungee text-6xl text-text-bright"> SLITHER. STRIKE.
                <span className={`${style.hero.heroAccent} block`}> SURVIVE. </span>
            </h1>

            <p className={style.hero.heroSub}>A multiplayer snake battleground where four serpents enter, one slithers out. Real-time. Cross-platform. No mercy.</p>

            <div className={style.hero.heroActions}>

                <Link  href="" className={style.btnPrimary}> ▶ Start Playing </Link>
                <Link  href="" className={style.btnPrimary}> Browser Rooms </Link>

            </div>
            
            <div className={style.features.featuresGrid}>

                {/* <canvas className='border-2 bg' ref={canvasRef} id="gameCanvas" width="600" height="400"> 
                   
                </canvas> */}
                {
                    rooms.map((room : any, index: number) => {
                        return (
                            <div key={index} className={style.features.featureCard}>
                                <h1>Name {room.name}</h1>
                                <h2> Max users:  {room.maxUsers}</h2>
                                <h2> Room type: {room.type} </h2>
                                <h2> Players : {room.Players}</h2>

                                <button name={room.id} onClick={(e) => {
                                    const id = e.currentTarget.name;
                                    setRooms((priv : any) => (priv.filter((item : any) => item.id !== id)));
                                    Api.deleteRequest("http://localhost:4000/api/rooms/" + id);
                                }}
                                    type="button" className={style.btnPrimary}>Delete Room</button>
                                <button name={String(index)}
                                onClick={(e) => {
                                    socketRef.current?.emit("join-room", {
                                        roomId: rooms[Number(e.currentTarget.name)].id,
                                        userId: userId,
                                    });
                                }}
                                    type='button' 
                                    className={style.btnPrimary}>
                                        {room.type === "PUBLIC" ? "Join Room " : "Invate to play "}
                                </button>
                            </div>
                        )
                    })
                }
               
            </div>
            <div className='m-5'>
                <button 
                    onClick={ async () => {
                     const obj = await Api.postRequest("http://localhost:4000/api/rooms/", {
                            name: "Room",
                            maxUser: 4,
                            type: "PRIVATE"
                        });
                        if (obj.statusCode){
                            return console.log("request fould ");
                        }
                        setRooms ((prev : any) => [...prev, obj]);
                    }}
                    type='button' className={style.btnPrimary}> Create private room </button>
            </div>

        </div>
    )
}
