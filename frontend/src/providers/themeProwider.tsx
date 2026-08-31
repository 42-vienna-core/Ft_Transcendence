'use client';

import { ThemeProvider } from 'next-themes';

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
        >
            {children}
        </ThemeProvider>
    );
}