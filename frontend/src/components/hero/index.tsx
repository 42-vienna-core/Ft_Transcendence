import Link from 'next/link';
import style from './hero.module.css'
import { useTranslations } from 'next-intl';

function Hero() {
    const t = useTranslations("HomePage");
    return (
        <div className={style.hero}>
            <div className={style.heroEyebrow}>// BUILT FOR REAL-TIME COMBAT</div>
            <h1 className="display">{t("motoFirst")}
                <span className={`${style.accent} block`}>{t("motoSecond")}</span>
            </h1>
            <p className={style.heroSub}>A multiplayer snake battleground where four serpents enter, one slithers out. Real-time. Cross-platform. No mercy.</p>
            <div className={style.heroActions}>
                <Link href="/dashboard" className={`${style.btn} ${style.btnPrimary} ${style.btnLarge}`}>▶ Start Playing</Link>
                <Link href="" className={`${style.btn} ${style.btnSecondary} ${style.btnLarge}`}>Browse Rooms</Link>
            </div>
        </div>
    )
}

export default Hero
