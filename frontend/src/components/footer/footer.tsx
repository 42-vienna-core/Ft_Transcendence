"use client"

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function Footer() {
    const t = useTranslations("Footer");
    const locale = useLocale();

    return (
        <footer className="w-full h-10 text-center py-5 pb-20 text-text-secondary">
            <span className="text-xs">© {new Date().getFullYear()} Snake — {t("rights")}</span>
            <div>
                <Link href={`/${locale}/privacy`} className=" mr-2 text-text-secondary hover:text-accent transition-colors">{t("privacy") }</Link>
                <Link href={`/${locale}/terms`} className="text-text-secondary hover:text-accent transition-colors">{ t("terms")}</Link>
            </div>
        </footer>
    );
}
