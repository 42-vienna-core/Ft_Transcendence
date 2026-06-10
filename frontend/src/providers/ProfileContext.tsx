'use client'

import { useSession } from "next-auth/react";
import { preloadVideo } from "pixi.js";
import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";

interface ProfileContextType {
    username: string;
    nameOnChange: string;
    avatar: string | null;
    updateNameOnChange: Dispatch<SetStateAction<string>>;
    updateSessionUsername: () => void;
    updateAvatar: (newUrl: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({children} : {children: React.ReactNode}) {
    const {data: session, update} = useSession();
    const [username, setUsername] = useState<string>("");
    const [nameOnChange, setnameOnChange] = useState<string>("");
    const [avatar, setAvatar] = useState<string | null>(null);

    useEffect(() => {
        if (session?.user) {
            const ava = session.user.avatar;
            setUsername(session.user.username);
            setnameOnChange(session.user.username);
            setAvatar(ava ? ava : "/png/default_avatar.png");
        }
    },[session])

    const updateSessionUsername = async () => {
        console.log("update session name");
        setUsername(nameOnChange);
        await update({user: {avatar, username: nameOnChange}});
    }

    const updateAvatar = async (newUrl: string | null) => {
        console.log("update avatar");

        setAvatar(newUrl);
        await update({user: {username, avatar: newUrl}});
    }

    const updateNameOnChange = setnameOnChange;

    return (
        <ProfileContext.Provider value={{
            username,
            avatar,
            nameOnChange,
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