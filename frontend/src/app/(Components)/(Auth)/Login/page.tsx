import Login from "./login";
import { cookies } from "next/headers";
import { redirect } from 'next/navigation';

export default async function Page() {
    const cookieStor = await cookies();
    const accessToken = cookieStor.get("accessToken")?.value;
    
    const userRes = await fetch("http://localhost:4000/api/auth/verifyAccess", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({accessToken}) ,
    });
    if (userRes.ok)
        redirect("/");
    return <Login />
}