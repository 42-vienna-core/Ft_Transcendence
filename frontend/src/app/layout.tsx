import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { bungee, inter } from "../ui/font";
import { Providers } from "@/providers/providers";
import "./globals.css"
import GlobalLobbyManager from "@/components/LobbyManager";

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
                    <ThemeProvider 
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                    >
                        {children}
                        <GlobalLobbyManager />
                    </ThemeProvider>
                </Providers> 
            </body>
        </html>
    );
}