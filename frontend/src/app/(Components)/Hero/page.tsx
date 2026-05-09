"use client"

import Link from 'next/link';
import style from "../../styles";
import { useState } from 'react';

function Hero() {
    const [value, setValue] = useState(true);

    return (
        <div className={style.hero.hero}>
                <h1 className="font-bungee text-6xl text-text-bright">SLITHER. STRIKE.
                    <span className={`${style.hero.heroAccent} block`}>SURVIVE.</span>
                </h1>
                <p className={style.hero.heroSub}>A multiplayer snake battleground where four serpents enter, one slithers out. Real-time. Cross-platform. No mercy.</p>
                <div className={style.hero.heroActions}>
                    <Link onClick={() => setValue(!value)} href="" className={value ? style.btnPrimary : style.btnSecondary}>▶ Start Playing</Link>
                    <Link onClick={() => setValue(!value)} href="" className={!value ? style.btnPrimary : style.btnSecondary}>Browse Rooms</Link>
                </div>
        </div>
    )
}

export default Hero