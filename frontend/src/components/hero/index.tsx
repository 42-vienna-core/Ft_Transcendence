import Link from 'next/link';
import style from './hero.module.css'
import { useEffect, useRef } from 'react';
import { io, Socket } from "socket.io-client"
import { useTranslations } from 'next-intl';

function Hero() {
    const t = useTranslations("HomePage");


        const socketUrl = process.env.FRONTEND_URL
        const socketRef = useRef<Socket | null>(null);

        useEffect( ()  => {

        socketRef.current = io(socketUrl, {
            auth : {
                token: "Bearer " + localStorage.getItem("accessToken")
            }
        });

        socketRef.current.on("connect", () => {
            console.log("✅ Socket connected!", socketRef.current?.id);
        });

        socketRef.current.on("room-update", (data) => {
            console.log("players:", data.players);
        })

        socketRef.current.on("game-start", () => {
            console.log("Start Game");
        });
        return () => {
            socketRef.current?.disconnect();
        }
    }, []);
    return (
        <div className={style.hero}>
            <div className={style.heroEyebrow}>// {t("title")}</div>
            <h1 className="display">{t("motoFirst")}
                <span className={`${style.accent} block`}>{t("motoSecond")}</span>
            </h1>
            <p className={style.heroSub}>{t("description")}</p>
            <div className={style.heroActions}>
                <Link href="/arena" className={`${style.btn} ${style.btnPrimary} ${style.btnLarge}`}>▶ {t("sBtn")}</Link>
            </div>
        </div>
    )
}

export default Hero
