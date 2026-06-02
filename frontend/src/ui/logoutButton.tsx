'use client'
import { fetchLogout } from "@/lib/action";
import { State } from "@/lib/definitions";
import { signOut } from "next-auth/react";
import { useState } from "react";


function LogoutBotton() {
    const [state, setState] = useState({pending: false});

    
    const handleLogout = async () => {
        setState(prev => ({...prev, pending: true}));

        const res = await fetchLogout();
        if (res?.success) {
            try {
                await signOut({
                    callbackUrl: '/login',
                    redirect: true
                });
            } catch (error) {
                setState(prev => ({...prev, pending: false}));
                console.log("An error occurred while logOut: ", error);
            }
        } else {
            setState(prev => ({...prev, pending: false}));
            console.log("The server has rejected the logout request : ");
        }
    }

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 transition-colors"
            disabled={state.pending}
        >
            {state.pending ? "Logging out..." : "Log Out"}
        </button>
    )
}

export default LogoutBotton;