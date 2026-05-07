import Link from 'next/link';
import style from './hero.module.css'
import SnakeRacer from '@/components/hero/index'

function Hero() {
    return (
        <div className={style.hero}>
            <div className={style.heroEyebrow}>// BUILT FOR REAL-TIME COMBAT</div>
            <h1 className="display">SLITHER. STRIKE.
                <span className={`${style.accent} block`}>SURVIVE.</span>
            </h1>
            <p className={style.heroSub}>A multiplayer snake battleground where four serpents enter, one slithers out. Real-time. Cross-platform. No mercy.</p>
            <div className={style.heroActions}>
                <Link href="" className="btn btnPrimary btnLarge">▶ Start Playing</Link>
                <Link href="" className="btn btnSecondary btnLarge">Browse Rooms</Link>
            </div>
        </div>
    )
}

export default Hero
