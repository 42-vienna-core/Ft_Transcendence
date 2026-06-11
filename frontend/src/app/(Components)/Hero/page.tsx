import { cookies }  from "next/headers";
import  Hero        from './Hero';
import { redirect } from 'next/navigation';

 const cookieStore = await cookies();
interface TokenObj {
    "accessToken": string,
    "refreshToken": string
}

async function getUser ()
{
    const token = cookieStore.get("accessToken")?.value;
     const user = await fetch("http://localhost:4000/api/auth/me", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    }).then((res) => res.json());
    return user;
}

export default async function Page() {

    const user = await getUser();
    if (!user)
    {
        const refreshToken = cookieStore.get("refreshToken")?.value;
        const res: TokenObj = await fetch("http://localhost:4000/api/auth/refresh", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: refreshToken,

        }).then((strim) => strim.json());
        if (!res)
            redirect("/Login");
        cookieStore.set("accessToken", res.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 15,
            path: "/",
	    });
	    cookieStore.set("refreshToken", res.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
	    });
        redirect("/");
    }
    return ( <Hero user={user}/> );
}