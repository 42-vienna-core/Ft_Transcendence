'use client'

import Link from 'next/link';
import style from './hero.module.css'
import { useTranslations } from 'next-intl';

function Hero() {
    const t = useTranslations("HomePage");

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
