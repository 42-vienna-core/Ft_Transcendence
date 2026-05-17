"use client"

import Link from 'next/link';
import style from "../../styles";

export default  function  Hero() {
    return (
        <div className={style.hero.hero}>
                <h1 className="font-bungee text-6xl text-text-bright">SLITHER. STRIKE.
                    <span className={`${style.hero.heroAccent} block`}>SURVIVE.</span>
                </h1>
                <p className={style.hero.heroSub}>A multiplayer snake battleground where four serpents enter, one slithers out. Real-time. Cross-platform. No mercy.</p>
                <div className={style.hero.heroActions}>
                    <Link onClick={() => localStorage.clear()}  href="" className={style.btnPrimary}>▶ Start Playing</Link>
                    <Link onClick={() => localStorage.clear()}  href="" className={style.btnPrimary}>Browse Rooms</Link>
                </div>
              
        </div>
    )
}