import { NextRequest, NextResponse } from "next/server";
import { Api } from "@/src/lib/api"
import { AuthType } from "./types/Types";

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    if (pathname === "/login" || pathname === "/register")
       return NextResponse.next();

    const accessToken = request.cookies.get("accessToken");
    if (accessToken)
        return NextResponse.next();
    console.log("proxy.ts lien 11")
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken)
        return NextResponse.redirect(new URL("/login", request.url));
    console.log("proxy.ts lien 15")
    try {
        const refreshRes: AuthType = await Api.postRequest("http://localhost:4000/api/auth/refresh", { refreshToken }).then((res) => res.json());
        if (!refreshRes.accessToken || !refreshRes.refreshToken)
            return NextResponse.redirect(new URL("/login", request.url));

        console.log("proxy.ts lien 21")
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
console.log("proxy.ts lien 44")
// //export const config = { matcher:  ["/", "/deshboard"] };
// export const config = {
//     matcher: ["/((?!api|_next|favicon.ico).*)"]
// };

export const config = {
    matcher: [
        "/",
        "/dashboard/:path*",
        "/profile/:path*",
        "/chat/:path*",
    ],
};