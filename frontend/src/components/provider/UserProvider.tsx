"use client"

import { createContext, useCallback, useContext, useState} from "react"
import { Api } from "@/src/lib/api"

type User = {
    id: number;
    Username: string,
    role: string,
} | null;

type UserContextType = {
    cntUser: User,
    //setCntUser: React.Dispatch<React.SetStateAction<User>>;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | null>(null);

export default function UserProvider ( 
    { 
        children, 
        initialUser, 
    } : {
            children: React.ReactNode,
            initialUser: User 
    } ) {

    const [ cntUser, setCntUser ] = useState<User>(initialUser);
    const refreshUser = useCallback( async () => {
        try {
            const res = await Api.getRequest("/api/me").then(r => r.json());
            setCntUser(res);
        }
        catch {
            setCntUser(null);
        }
    },[])
    
    return (
        <UserContext.Provider value={{cntUser, refreshUser}}>
            {children}
        </UserContext.Provider>
    )
}

export function useAuth () {
    const ctx = useContext(UserContext);
    if (!ctx)
        throw new Error("useAuth must be used inside UserProvider");
    return ctx;
}