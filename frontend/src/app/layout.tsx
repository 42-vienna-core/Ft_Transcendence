import type { Metadata } from 'next';
import './globals.css'
import {bungee, inter} from '../ui/font'
import Nav from '../ui/nav/index'
import Background from '@/ui/bg/index'

export const metadata: Metadata = {
  title: 'Snake Multiplayer',
  description: 'Real-time multiplayer Snake game',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bungee.variable}`}>
      <body
        className={`${inter.className} bg-[#050507] text-white antialiased`}
        suppressHydrationWarning
      >
        <Background>
          <main>
            <Nav />
            {children}
          </main>
        </Background>
      </body>
    </html>
  );
}
