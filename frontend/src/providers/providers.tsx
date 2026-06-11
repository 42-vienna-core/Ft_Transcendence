'use client';

import { SessionProvider } from 'next-auth/react'
import React from 'react';
import { ProfileProvider } from './ProfileContext';

export function Providers({children}: {children: React.ReactNode}) {
    return (
        <SessionProvider>
            <ProfileProvider>
                {children}
            </ProfileProvider>
        </SessionProvider>
    );
}