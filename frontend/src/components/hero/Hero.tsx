
import Link from 'next/link';
import style from "@/src/styles/styles"

export default  function  Hero() {

    return (
        <div className={`${style.hero.hero} bg`}>

            <h1 className="font-bungee text-6xl text-text-bright"> SLITHER. STRIKE.
                <span className={`${style.hero.heroAccent} block`}> SURVIVE. </span>
            </h1>

            <p className={style.hero.heroSub}>A multiplayer snake battleground where four serpents enter, one slithers out. Real-time. Cross-platform. No mercy.</p>

            <div className={style.hero.heroActions}>
                <Link  href="/deshboard" className={style.btnPrimary}> ▶ Start Playing </Link>
                <Link  href="/deshboard" className={style.btnPrimary}> Browser Rooms </Link>
            </div>
            
            <div className={style.features.featuresGrid}> </div>
            
        </div>
    )
}
