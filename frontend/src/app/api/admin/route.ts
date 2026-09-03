import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from 'next/server';

async function getAccessTokenFromCookie() {
    const session = await getServerSession(authOptions);
    if (!session) return;
    return session.accessToken;
}

const backendUrl = process.env.INTERNAL_API_URL;

export async function DELETE (request: NextRequest) {

    try {
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
    catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT (request: NextRequest) {

    try {
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
    catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


export async function POST (request: NextRequest) {

    try {
        console.log("1111111111111111111111111111");

        const body = await request.json();
        const path = request.nextUrl.searchParams.get("path") ?? "";
        const res = await fetch(backendUrl + path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
        console.log("2222222222222222222222222222222");

        const data = await res.json();
        return Response.json(data, { status: res.status });
    } catch {
        console.log("333333333333333333333333333333333");

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}


export async function PATCH (request: NextRequest) {

    try {
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
    catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET( request: NextRequest) {
    
    try {
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
    catch {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}