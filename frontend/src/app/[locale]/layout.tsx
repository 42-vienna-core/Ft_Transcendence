import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import Footer from "@/components/footer/footer";
import LegalModal from "@/components/Legal/LegalModal";
import GlobalLobbyManager from "@/components/LobbyManager";

export default async function LangLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    if (!['en', 'ru', 'de', 'it'].includes(locale)) {
        notFound();
    }

    const messages = await getMessages({ locale });

    return (
        <NextIntlClientProvider
            messages={messages}
            locale={locale}
        >
            {children}
            <LegalModal />
            <GlobalLobbyManager/>
        </NextIntlClientProvider>
    );
}