"use client"
import Link from 'next/link';
import style from './hero.module.css'
import { useEffect, useRef } from 'react';
import { io, Socket } from "socket.io-client"
import SnakeRacer from '@/components/hero/index'

function Hero() {

        const socketUrl = process.env.FRONTEND_URL
        const socketRef = useRef<Socket | null>(null);

        useEffect( ()  => {

        socketRef.current = io(socketUrl);

        socketRef.current.on("connect", () => {
            console.log("✅ Socket connected!", socketRef.current?.id);
        });

        socketRef.current.on("room-update", (data) => {
            console.log("players:", data.players);
        })

        socketRef.current.on("gmae-start", () => {
            console.log("Start Game");
        });
        return () => {
            socketRef.current?.disconnect();
        }
    }, []);
    
    return (
        <div className={style.hero}>
            <div className={style.heroEyebrow}>// BUILT FOR REAL-TIME COMBAT</div>
            <h1 className="display">SLITHER. STRIKE.
                <span className={`${style.accent} block`}>SURVIVE.</span>
            </h1>
            <p className={style.heroSub}>A multiplayer snake battleground where four serpents enter, one slithers out. Real-time. Cross-platform. No mercy.</p>
            <div className={style.heroActions}>
                <Link href="/dashboard" className="btn btnPrimary btnLarge">▶ Start Playing</Link>
                <Link href="" className="btn btnSecondary btnLarge">Browse Rooms</Link>
            </div>
        </div>
    )
}

export default Hero
