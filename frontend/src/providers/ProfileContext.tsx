'use client'

import { useSession } from "next-auth/react";
import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";

interface ProfileContextType {
    username: string;
    avatar: string | null;
    updateNameOnChange: Dispatch<SetStateAction<string>>;
    updateSessionUsername: (newUsername: string) => void;
    updateAvatar: (newUrl: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({children} : {children: React.ReactNode}) {
    const {data: session, update} = useSession();
    const [username, setUsername] = useState<string>("");
    const [avatar, setAvatar] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user) {
            const ava = session.user.avatar;
            setUsername(session.user.username);
            setAvatar(ava ? ava : "/png/default_avatar.png");
        }
    },[session])

    const updateSessionUsername = async (newUsername: string) => {
        setUsername(newUsername);
        await update({user: {username: newUsername}});
    }

    const updateAvatar = async (newUrl: string | null) => {
        setAvatar(newUrl);
        await update({user: {avatar: newUrl}});
    }

    const updateNameOnChange = setUsername;

    return (
        <ProfileContext.Provider value={{
            username,
            avatar,
            updateSessionUsername, 
            updateAvatar,
            updateNameOnChange
            }}>
            {children}
        </ProfileContext.Provider>
    )
}

export function useProfile() {
    const context = useContext(ProfileContext);
    if (!context) {
        throw new Error('useProfile must be used within a ProfileProvider')
    }
    return context;
}