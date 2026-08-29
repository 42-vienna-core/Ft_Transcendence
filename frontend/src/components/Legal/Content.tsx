import Link from "next/link";
import { useTranslations } from "next-intl";

const LINK_TOKEN = "{link}";

type keyType = "termsOfService" | "privacyPolicy";

export default function Content ({nameKey} : {nameKey: keyType}) {

        const LEGAL = useTranslations(`Legal.${nameKey}`);
        const LEGAL_ROOT = useTranslations("Legal");
        const FOOTR = useTranslations("Footer");
        const sections = LEGAL.raw("sections") as Array<{
            heading: string;
            text?: string;
            items?: { label?: string; text: string }[];
        }>;
        const withCrossLink = (text: string) => {

            const idx = text.indexOf(LINK_TOKEN);
            if (idx === -1)
                return text;
            return (
                <>
                    {text.slice(0, idx)}
                        <Link href={`/${nameKey === "termsOfService" ? "privacy" : "terms"}`} className="font-medium text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:decoration-accent">
                            {nameKey === "privacyPolicy" ?  FOOTR("terms") :  FOOTR("privacy")}
                        </Link>
                    {text.slice(idx + LINK_TOKEN.length)}
                </>
            );
        };

    return (
        <>
            <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">{LEGAL_ROOT("eyebrow")}</span>
                <h1 className="display mt-1 text-2xl tracking-tight text-text-primary sm:text-3xl">{LEGAL("title")}</h1>
                <p className="mt-2 text-xs font-medium text-text-tertiary">{LEGAL("updated")}</p>
            </div>

            <p className="text-sm leading-relaxed text-text-secondary">{LEGAL("intro")}</p>

            {sections.map((section, i) => (
                <section className="flex flex-col gap-2 border-t border-border-default pt-6" key={i}>
                    <h2 className="text-base font-semibold tracking-tight text-text-primary">{section.heading}</h2>
                    {section.text && (
                        <p className="text-sm leading-relaxed text-text-secondary">{withCrossLink(section.text)}</p>
                    )}
                    {section.items && (
                        <ul className="flex flex-col gap-1.5 pl-1 text-sm leading-relaxed text-text-secondary">
                            {section.items.map((item, j) => (
                                <li className="flex gap-2 before:mt-2 before:h-1 before:w-1 before:shrink-0 before:rounded-full before:bg-accent before:content-['']" key={j}>
                                    <span>
                                        {item.label && <strong>{item.label}</strong>}{item.label ? " " : ""}{item.text}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            ))}
        </>
    )
}