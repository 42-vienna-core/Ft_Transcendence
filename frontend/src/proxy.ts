import { NextRequest, NextResponse } from "next/server";
import { Api } from "@/src/lib/api"

interface Token {
    accessToken: string,
    refreshToken: string,
    user: {id: number, Username: string}
}

export async function proxy(request: NextRequest) {
    console.log("proxy was caled")
    const accessToken = request.cookies.get("accessToken");
    if (accessToken)
        return NextResponse.next();
    console.log("proxy lien 16")
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken)
        return NextResponse.redirect(new URL("/login", request.url));

    try {
        const refreshRes: Token = await Api.postRequest("http://localhost:4000/api/auth/refresh", { refreshToken }).then((res) => res.json());
        if (!refreshRes.accessToken || !refreshRes.refreshToken)
            return NextResponse.redirect(new URL("/login", request.url));
        console.log("proxi lien 26")
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

export const config = {
  //matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
    matcher: ["/"],
};