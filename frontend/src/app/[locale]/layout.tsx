import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { bungee, inter } from "../../ui/font";
import "./globals.css";
import { Providers } from "@/providers/providers";
import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";

export const metadata: Metadata = {
    title: "Snake Multiplayer",
    description: "Real-time multiplayer Snake game",
};

export default async function rootLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{locale: string}>;
}) {
    const {locale} = await params;
    if (!['en', 'ru', 'de', 'it'].includes(locale)) {
        notFound();
    }

    const messages = await getMessages({ locale });
    console.log("messages", messages);
    return (
        <html 
            lang={locale} 
            className={`${bungee.variable}`}
            suppressHydrationWarning
        >
            <body suppressHydrationWarning>
                <Providers>
                    <ThemeProvider 
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                    >
                        <NextIntlClientProvider 
                            messages={messages}
                            locale={locale}
                        >
                            {children}
                        </NextIntlClientProvider>
                    </ThemeProvider>
                </Providers>
            </body>
        </html>
    );
}
