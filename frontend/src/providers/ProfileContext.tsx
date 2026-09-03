'use client';

import { apiFetch } from "@/lib/api-client";
import { getErrorMessage } from "@/lib/error";
import { dateConvertor } from "@/ui/utils";
import { useSession } from "next-auth/react";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface UserData {
    avatar: string | null;
    color: string;
    name: string;
    role: "ADMIN" | "PLAYER";
    score: number;
    level: number;
    createdAt: string;
}

interface ProfileContextType {
    id: number;
    username: string;
    email: string;
    nameOnChange: string;
    avatar: string;
    level: number;
    createdAt: string | null | undefined;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    role: "ADMIN" | "PLAYER";
    termsAcceptedAt: string | null;
    hasUpdatedData: {current: boolean};
    updateNameOnChange: (name: string) => void;
    updateSessionUsername: () => Promise<void>;
    updateAvatar: (newUrl: string) => Promise<void>;
    updateSession: (checkSession: boolean) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
    const { data: session, update, status } = useSession();
    const [nameOnChange, setNameOnChange] = useState<string>("");

    const hasUpdatedData = useRef<boolean>(false);

    useEffect(() => {
        if (session?.user?.username) {
            setNameOnChange(session.user.username);
        }
    }, [session?.user?.username]);

    useEffect(() => {
        async function updateUserData() {
            try {
                const updatedMe = await apiFetch('user/me') as UserData;

                await update({
                    user: {
                        ...session?.user,
                        ...updatedMe,
                        username: updatedMe.name
                    }
                });
            } catch (error) {
                toast.error(getErrorMessage(error));
            } finally {
                hasUpdatedData.current = true;
            }
        }
       
        if (status === "authenticated" && session?.user?.id && !hasUpdatedData.current) {
            updateUserData();
        }

    }, [status]);

    const id = session?.user?.id ?? 0;
    const username = session?.user?.username ?? "";
    const email = session?.user?.email ?? "";
    const avatar = session?.user?.avatar ?? "/png/default_avatar.png";
    const role = session?.user?.role ?? "PLAYER";
    const level = session?.user.level ?? 0;
    const createdAt = dateConvertor(session?.user.createdAt);
    const termsAcceptedAt = session?.user?.termsAcceptedAt ?? null

    if (nameOnChange && nameOnChange.length < 3) {
        toast.error("Error: username less then 3");
    }

    if (nameOnChange && nameOnChange.length > 40) {
        toast.error("Error: username is too long");
    }

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
            id, username,
            email,
            avatar,
            level,
            createdAt,
            nameOnChange,
            status,
            role,
            termsAcceptedAt,
            hasUpdatedData,
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
