'use client';

import { SessionProvider } from 'next-auth/react'
import React from 'react';
import { ProfileProvider } from './ProfileContext';
import { SocketProvider } from './SocketProvider';
import { Session } from 'next-auth';

export function Providers({
    children, 
}: {
    children: React.ReactNode;
}) {
    return (
        <SessionProvider>
            <ProfileProvider>
                <SocketProvider>
                    {children}
                </SocketProvider>
            </ProfileProvider>
        </SessionProvider>
    );
}