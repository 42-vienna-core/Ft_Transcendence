import  Hero        from './Hero';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function Page() {

    const cookieStor = await cookies();
    const accessToken = cookieStor.get("accessToken")?.value;
   
    if (!accessToken)
        redirect("/Login");
    const userRes = await fetch("http://localhost:4000/api/auth/verifyAccess", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({accessToken}) ,
    });
    if (!userRes.ok)
        redirect("/Login");
    return ( <Hero /> );
} 