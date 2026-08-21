'use client';

import { useSession } from "next-auth/react";
import React, { createContext, useContext, useEffect, useState } from "react";

interface ProfileContextType {
    id: number;
    username: string;
    email: string;
    nameOnChange: string;
    avatar: string;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    role: "ADMIN" | "PLAYER";
    
    updateNameOnChange: (name: string) => void;
    updateSessionUsername: () => Promise<void>;
    updateAvatar: (newUrl: string) => Promise<void>;
    updateSession: (checkSession: boolean) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const { data: session, update, status } = useSession();
    const [nameOnChange, setNameOnChange] = useState<string>("");

    useEffect(() => {
        if (session?.user?.username) {
            setNameOnChange(session.user.username);
        }
    }, [session?.user?.username]);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'production' && session) {
            console.log("🔄 ProfileProvider: Session is already updated:", session.user);
        }
    }, [session]);

    const id = session?.user?.id ?? 0;
    const username = session?.user?.username ?? "";
    const email = session?.user?.email ?? "";
    const avatar = session?.user?.avatar ?? "/png/default_avatar.png";
    const role = session?.user?.role ?? "PLAYER";

    const updateSessionUsername = async () => {
        if (!session?.user) return;
        await update({
            user: {
                ...session.user,
                username: nameOnChange
            }
        });
    };

    const updateAvatar = async (newUrl: string) => {
        if (!session?.user) return;
        await update({
            user: {
                ...session.user,
                avatar: newUrl
            }
        });
    };

    const updateSession = async (checkSession: boolean) => {
        await update({ checkSession });
    };

    return (
        <ProfileContext.Provider value={{
            id,
            username,
            email,
            avatar,
            nameOnChange,
            status,
            role,
            updateSession,
            updateSessionUsername, 
            updateAvatar,
            updateNameOnChange: setNameOnChange
        }}>
            {children}
        </ProfileContext.Provider>
    );
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
}
