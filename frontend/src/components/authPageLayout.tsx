"use client"

import { useTranslations } from "next-intl";
import React from "react";

interface LoginProps {
    keyTranslation: string;
    children: React.ReactNode;
}

export default function AuthPageLayout({
    keyTranslation,
    children,
}: LoginProps) {
    const t = useTranslations(keyTranslation);
    return (
        <div className="relative z-30 flex min-h-screen w-full items-center justify-center px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-border-default bg-surface/90 p-8 shadow-xl shadow-black/5 backdrop-blur-sm transition-all duration-300 hover:border-accent/40 hover:shadow-2xl hover:shadow-accent-soft">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-text-primary">{t("title")}</h2>
                    <p className="mt-1 text-sm text-text-secondary">{t("expla")}</p>
                </div>
                {children}
            </div>
        </div>
    );
}
