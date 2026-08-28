'use client'

import { useTranslations } from 'next-intl';

function Hero() {
    const t = useTranslations("HomePage");

    return (
        <div className="relative px-4 pt-10 text-center sm:px-8 sm:pt-20">
            <div className="mb-8 inline-block rounded-full border border-accent bg-[rgba(0,255,156,0.05)] px-3.5 py-1.5 font-mono text-xs uppercase tracking-[0.2em] text-accent">
                // {t("title")}
            </div>
            <h1 className="display mb-6 break-words text-3xl leading-none text-text-primary sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">{t("motoFirst")}
                <span className="block text-accent [text-shadow:0_0_40px_var(--color-accent)]">{t("motoSecond")}</span>
            </h1>
            <p className="mx-auto mb-12 max-w-[600px] text-xl text-text-primary">{t("description")}</p>
        </div>
    )
}

export default Hero
