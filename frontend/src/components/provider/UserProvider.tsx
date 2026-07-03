"use client"

import { createContext, useCallback, useContext, useState} from "react"
import { Api } from "@/src/lib/api"
import { UserType,  UserContextType} from "@/src/types/Types"

const UserContext = createContext<UserContextType | null>(null);

export default function UserProvider ( 
    { 
        children, 
        initialUser, 
    } : {
            children: React.ReactNode,
            initialUser: UserType 
    } ) {

    const [ cntUser, setCntUser ] = useState<UserType>(initialUser);
    const refreshUser = useCallback( async () => {
        
        if (cntUser !== null)
        {
            setCntUser({...cntUser});
            return;
        }
        try {
            const res = await Api.getRequest("/api/auth").then(r => r.json());
            setCntUser(res);
        }
        catch {
            setCntUser(null);
        }
    },[])
    
    return (
        <UserContext.Provider value={{cntUser, setCntUser, refreshUser}}>
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