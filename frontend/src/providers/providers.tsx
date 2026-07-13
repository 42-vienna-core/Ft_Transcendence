'use client';

import { SessionProvider } from 'next-auth/react'
import React from 'react';
import { ProfileProvider } from './ProfileContext';
import { SocketProvider } from './SocketProvider';
import { Session } from 'next-auth';

export function Providers({
    children, 
    session
}: {
    session: Session | null;
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <ProfileProvider>
                <SocketProvider
                    token={session?.accessToken}
                >
                    {children}
                </SocketProvider>
            </ProfileProvider>
        </SessionProvider>
    );
}