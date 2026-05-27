"use client"

import Link from 'next/link';
import style from "../../styles";
import {useState, useEffect } from 'react';
import Api from "../../api"

import {io } from "socket.io-client"

export default  function  Hero() {

    // const canvasRef = useRef<HTMLCanvasElement>(null);

    const socket = io("http://localhost:2000/");
    const [rooms, setRooms] = useState<any[]>([]);
    const [cordinates, setCordinates] = useState({ x: 0, y: 0, w: 20, h: 20 , start: false});

    useEffect(() => {
        
        socket.on("connect", () => {
            console.log("✅ Socket connected!", socket.id);

            setRooms((prev) => [...prev, rooms]);
        });
        return () => {
            socket.off("room_created");
        }
    }, [])

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

                <Link onClick={() => setCordinates({...cordinates, start: !cordinates.start})}  href="" className={style.btnPrimary}> {!cordinates.start ? "▶ Start Playing" : "⏸  Pause Playing"} </Link>
                <Link onClick={() => {
                    Api.postRequest("http://localhost:4000/api/rooms", {"name": "Rafo", "maxUsers" : 4})
                    .then((res) => res ? res.json() : console.log('Error'))
                    .then((obj) => console.log(obj))
                }}  href="" className={style.btnPrimary}> Browser Rooms </Link>

            </div>
            
            <div className={style.features.featuresGrid}>

                {/* <canvas className='border-2 bg' ref={canvasRef} id="gameCanvas" width="600" height="400"> 
                   
                </canvas> */}
                {
                    rooms.map((room, index) => {
                        return (
                            <div key={index} className={style.features.featureCard}>
                                <h1>Room</h1>
                                <h2>{`Name: ${room.name}`}</h2>
                                <h2> {`Max users: `}</h2>


                            </div>
                        )
                    })
                }
                <div className={style.features.featureCard}>
                    <div className={style.features.featureIcon}>🏆</div>
                    <h3>Global Leaderboards</h3>
                    <p>
                        Track wins, scores, win rates. Climb the ranks and prove you're
                        the apex serpent.
                    </p>
                </div>
               
              

            </div>

        </div>
    )
}
