"use client"

import Link from "next/link";
import Content from "./Content"
import { useTranslations } from "use-intl";

export default function TermsOfService({ embedded = false }: { embedded?: boolean }) {
    const LN = useTranslations("Legal");

    return (
    <>
        {embedded ? (
            <div className="flex flex-col gap-8">
                <Content nameKey="termsOfService"/>
            </div>
            ) : (
                <div className="flex min-h-screen w-full justify-center bg-bg-base px-4 py-12 text-text-primary transition-colors duration-300 sm:px-6">
                    <div className="flex w-full max-w-3xl flex-col gap-6">
                        <Link href="/" className="w-fit text-sm font-medium text-text-secondary transition-colors hover:text-accent">&larr; {LN("back")}</Link>

                        <div className="w-full overflow-hidden rounded-2xl border border-border-default bg-bg-surface shadow-modal">
                            <div className="flex flex-col gap-8 p-6 sm:p-10">
                                <Content nameKey="termsOfService"/>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
     </>
    );
}
