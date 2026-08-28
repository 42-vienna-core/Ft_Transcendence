'use client';

import { useTheme } from 'next-themes';
import { Toaster } from 'sonner';

export default function AppToaster() {
    const { resolvedTheme } = useTheme();

    return (
        <Toaster
            theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
            position="top-right"
            richColors
            closeButton
            toastOptions={{
                style: {
                    background: 'var(--color-bg-surface)',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-default)',
                    fontFamily: 'var(--font-sans)',
                },
            }}
        />
    );
}
