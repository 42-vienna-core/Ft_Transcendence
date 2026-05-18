import {redirect } from 'next/navigation';
import {cookies} from "next/headers";

import Hero from './Hero';

export default async function Page() {

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token)
    {
        redirect("/Login");
    }
    const res = await fetch("http://localhost:4000/api/user/profile", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok)
        redirect("/Login");
    return ( <Hero /> )
}