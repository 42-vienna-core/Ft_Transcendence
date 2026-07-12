import { NextRequest, NextResponse } from "next/server";
import { Api } from "@/src/lib/api"
import { AuthType } from "./types/Types";

export async function proxy(request: NextRequest) {

    console.log("Proxy middleware called for URL:");
    const pathname = request.nextUrl.pathname;
    if (pathname === "/login" || pathname === "/register" || pathname === "/reset")
       return NextResponse.next();

    const accessToken = request.cookies.get("accessToken");
    if (accessToken)
        return NextResponse.next();

    console.log("Access token not found, attempting to refresh...");
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken)
        return NextResponse.redirect(new URL("/login", request.url));
    console.log("Refresh token found, attempting to refresh access token...");
    try {
        const refreshRes: AuthType = await Api.postRequest(process.env.INTERNAL_API_URL + "/auth/refresh", { refreshToken }).then((res) => res.json());
        if (!refreshRes.accessToken || !refreshRes.refreshToken)
            return NextResponse.redirect(new URL("/login", request.url));
        console.log("Access token refreshed successfully, setting cookies...");
        const response = NextResponse.next();
        response.cookies.set("accessToken", refreshRes.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 15,
            path: "/",
        });

        response.cookies.set("refreshToken", refreshRes.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });
        return response;
    }
    catch {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = { matcher: [ "/", "/dashboard/:path*", "/profile/:path*" ] };