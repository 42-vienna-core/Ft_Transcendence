'use client'

import { signOut } from "next-auth/react";

function LogoutBotton() {
    const handleLogout = async () => {
        // await fetchLogout();

        await signOut({
            callbackUrl: '/login',
            redirect: true
        });
    }

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded text-white hover:bg-red-700 transition-colors"
        >
            Log Out
        </button>
    )
}

export default LogoutBotton;