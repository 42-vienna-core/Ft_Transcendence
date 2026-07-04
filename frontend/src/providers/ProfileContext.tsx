'use client'

import {signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from "react";

interface ProfileContextType {
    id: number;
    username: string;
    email: string;
    nameOnChange: string;
    avatar: string | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    updateNameOnChange: Dispatch<SetStateAction<string>>;
    updateSessionUsername: () => void;
    updateAvatar: (newUrl: string) => void;
    updateSession: (checkSession: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({children} : {children: React.ReactNode;}) {
    const {data: session, update, status,} = useSession();
    const [username, setUsername] = useState<string>("");
    const [nameOnChange, setnameOnChange] = useState<string>("");
    const [avatar, setAvatar] = useState<string | null>(null);
    const [email, setEmail] = useState<string>("");
    const [id, setId] = useState<number>(0);

    
    console.log("PROFILEPROVIDER useSession");


    useEffect(() => {
        if (session?.error === "RefreshAccessTokenError" && status === "authenticated") {
            signOut({callbackUrl: "/login"});
            console.log("session?.error: ", session?.error);
        } 

        if (session?.user) {
            const ava = session.user.avatar;
            setId(session.user.id);
            setUsername(session.user.username);
            setEmail(session.user.email);
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

    const updateSession =  async (checkSession: boolean) => {
        await update({checkSession: true});
    }

    return (
        <ProfileContext.Provider value={{
            id,
            username,
            email,
            avatar,
            nameOnChange,
            status,
            updateSession,
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