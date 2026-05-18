"use client"

import Link from 'next/link';
import style from "../../styles";
import { useEffect, useRef, useState } from 'react';

export default  function  Hero() {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cordinates, setCordinates] = useState({ x: 0, y: 0, w: 20, h: 20 , start: false});

    useEffect(() => {

        const canvas = canvasRef.current;
        const cont = canvas?.getContext('2d');

        if (!canvas || !cont) return;

         if (!cordinates.start) 
           return cont.clearRect(0, 0, canvas.width, canvas.height);

        cont.fillStyle = "red";

        function drow () : void {
            if (!canvas || !cont) return;
            cont.clearRect(0, 0, canvas.width, canvas.height);
            cont.fillRect(cordinates.x, cordinates.y, cordinates.w, cordinates.h);
        }

        function handleKeyDown (e: KeyboardEvent) : void {
             if (!canvas || !cont) return;
            e.preventDefault();
            if (e.key === "ArrowRight") {
                if(cordinates.x + 10 + cordinates.w > canvas?.width) return;
                setCordinates({...cordinates, x: cordinates.x + 10});
            }
            if (e.key === "ArrowLeft") {
                if(cordinates.x - 10 < 0) return;
                setCordinates({...cordinates, x: cordinates.x - 10})
            }

            if (e.key === "ArrowUp") {
                if(cordinates.y - 10 < 0) return;
                setCordinates({...cordinates, y: cordinates.y - 10})
            }

            if (e.key === "ArrowDown")
            {
                if(cordinates.y + 10 + cordinates.h > 400) return;
                setCordinates({...cordinates, y: cordinates.y + 10})
            }
            drow();
        }
        
        drow();
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, [cordinates])

    return (
        <div className={`${style.hero.hero} bg`}>

            <h1 className="font-bungee text-6xl text-text-bright"> SLITHER. STRIKE.
                <span className={`${style.hero.heroAccent} block`}> SURVIVE. </span>
            </h1>

            <p className={style.hero.heroSub}>A multiplayer snake battleground where four serpents enter, one slithers out. Real-time. Cross-platform. No mercy.</p>

            <div className={style.hero.heroActions}>

                <Link onClick={() => setCordinates({...cordinates, start: !cordinates.start})}  href="" className={style.btnPrimary}> {!cordinates.start ? "▶ Start Playing" : "⏸  Pause Playing"} </Link>
                <Link onClick={() => alert("Browse Rooms")}  href="" className={style.btnPrimary}>Browse Rooms</Link>

            </div>
            
            <div className='w-full flex justify-center'>

                <canvas className='border-2 bg' ref={canvasRef} id="gameCanvas" width="600" height="400"> 
                   
                </canvas>

            </div>

        </div>
    )
}
