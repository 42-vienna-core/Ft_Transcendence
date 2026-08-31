import type { Metadata } from "next";
import { bungee, inter } from "../ui/font";
import { Providers } from "@/providers/providers";
import "./globals.css"
import AppToaster from "@/components/app-toaster";
import { CustomThemeProvider } from "@/providers/themeProwider";

export const metadata: Metadata = {
    title: "Snake Multiplayer",
    description: "Real-time multiplayer Snake game",
};

export default function rootLayout({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <html 
            className={`${bungee.variable}`} 
            suppressHydrationWarning
        >
            <body suppressHydrationWarning>
                <Providers>
                    <CustomThemeProvider>
                        {children}
                        <AppToaster />
                    </CustomThemeProvider>
                </Providers> 
            </body>
        </html>
    );
}