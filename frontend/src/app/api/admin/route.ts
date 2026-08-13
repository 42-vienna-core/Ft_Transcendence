import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { Erica_One } from "next/font/google";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from 'next/server';

async function getAccessTokenFromCookie() {
    const session = await getServerSession(authOptions);
    if (!session) return;
    return session.accessToken;
}

const backendUrl = process.env.INTERNAL_API_URL;

export async function DELETE (request: NextRequest) {

    const path = request.nextUrl.searchParams.get("path") ?? "";
    const accessToken = await getAccessTokenFromCookie();

    if (!accessToken)
        return  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const res = await fetch(backendUrl + path, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
    });
    return Response.json(res.ok);
}

export async function PUT (request: NextRequest) {

    const body = await request.json();
    const path = request.nextUrl.searchParams.get("path") ?? "";
    const session = await getServerSession(authOptions);

    if (!session) return;
    const { accessToken} = session;

    if (!accessToken)
        return  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const res = await fetch(backendUrl + path, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
    });
    const result = await res.json();
    return Response.json(result, { status: res.status });
}


export async function POST (request: NextRequest) {

    try {
        const body = await request.json();
        const path = request.nextUrl.searchParams.get("path") ?? "";
        const res = await fetch(backendUrl + path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        const data = await res.json();
        return Response.json(data, { status: res.status });
    } catch {
        throw new Error()
    }
}


export async function PATCH (request: NextRequest) {

    const body = await request.json();
    const path = request.nextUrl.searchParams.get("path") ?? "";
    const accessToken  = await getAccessTokenFromCookie();

   if(!accessToken)
        return  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const res = await fetch(backendUrl + path, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
    });
    return Response.json(res, { status: res.status });
}

export async function GET( request: NextRequest) {
    
    const path = request.nextUrl.searchParams.get("path") ?? "";
    const session = await getServerSession(authOptions);
    if (!session) return;
    const { accessToken} = session;
    if (!accessToken) return Response.json(null, { status: 401 });

    const res = await fetch(backendUrl + path, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${accessToken}`,
        },
    }).then(res => res.json())
    return Response.json(res, { status: res.status });

}