import { cookies } from "next/headers";
import { NextResponse } from "next/server";

interface Token {
    "accessToken": string,
    "refreshToken": string,
}

async function getUser (token: string) {
    
    const user = await fetch("http://localhost:4000/api/auth/verifyAccess", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({accessToken: token})
    }).then((strim) => strim.json());
    return user;
}

export async function GET (req : Request) {

    const cookieStore = await cookies();
    const accessToken  = cookieStore.get("accessToken")?.value;

    console.log("26 line ", accessToken)
    let userRes = await getUser(accessToken || "");
    console.log(userRes);
    if (!userRes.ok)
    {
        const refreshToken = cookieStore.get("refreshToken")?.value;
        if (!refreshToken)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const refreshRes = await fetch("http://localhost:4000/api/auth/refresh", 
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: refreshToken,
        });
        if (!refreshRes.ok)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const tokens: Token = await refreshRes.json();
        if (!tokens.accessToken || !tokens.refreshToken)
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        cookieStore.set("accessToken", tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 15,
            path: "/",
        });
        cookieStore.set("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });
        userRes = await getUser(tokens.accessToken);
        if (!userRes.ok)
             return NextResponse.json({ success: false });
    }
    const user = await userRes.json();
    return  NextResponse.json(user);
}
