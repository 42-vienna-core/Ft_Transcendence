"use client"

import { createContext, useContext} from "react"

type User = {
    id: number;
    Username: string,
    role: string,
} | null;

const UserContext = createContext<User>(null);

export default function UserProvider ( { children, initialUser } : { children: React.ReactNode, initialUser: User }) {
    return (
        <UserContext.Provider value={initialUser}>
            {children}
        </UserContext.Provider>
    )
}

export function useAuth () {
    return useContext(UserContext);
}