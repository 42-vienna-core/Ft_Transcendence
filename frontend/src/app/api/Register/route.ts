import { NextResponse } from "next/server";
import { Api } from "@/src/lib/api"

interface Token {
    accessToken: string,
    refreshToken: string,
    user: { id: number, Username: string},
}

export async function POST ( req : Request) {

    const body = await req.json();

    const res : Token = await Api.postRequest("http://localhost:4000/api/auth/register", body).then(strim => strim.json());

    if (res.accessToken === undefined || res.refreshToken === undefined)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // const response = NextResponse.json({user: res.user});
    const response = NextResponse.json({success: true});

    response.cookies.set("accessToken", res.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 15,
        path: "/",
    });

    response.cookies.set("refreshToken", res.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
    });

    return response;
}