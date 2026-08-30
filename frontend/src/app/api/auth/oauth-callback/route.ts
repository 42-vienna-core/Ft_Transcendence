import { NextResponse, NextRequest } from "next/server";
import { encode } from "next-auth/jwt";

const env = process.env;
const SECRET = env.NEXTAUTH_SECRET as string;
const SECURE_COOKIE = env.NEXTAUTH_URL?.startsWith('https://') ?? !!env.VERCEL;
const SESSION_COOKIE_NAME = `${SECURE_COOKIE ? '__Secure-' : ''}next-auth.session-token`;

const rawAccessTTL = env.JWT_ACCESS_TTL?.match(/\d+/)?.[0] || '15';
const rawRefreshTTL = env.JWT_REFRESH_TTL?.match(/\d+/)?.[0] || '7';
const JWT_ACCESS_TTL = Number(rawAccessTTL);
const JWT_REFRESH_TTL = Number(rawRefreshTTL);

const REFRESH_AGE = (JWT_ACCESS_TTL - 1) * 60 * 1000;
const COOKIE_MAX_AGE = JWT_REFRESH_TTL * 24 * 60 * 60;

export async function GET(req: NextRequest) {
    const params = req.nextUrl.searchParams;
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const id = params.get("id");
    const name = params.get("name");
    const role = params.get("role");
    const avatar = params.get("avatar");
    const termsAcceptedAt = params.get("termsAcceptedAt");
    const createdAt = params.get("createdAt");

    if (!accessToken || !refreshToken || !id) {
        return NextResponse.redirect(new URL("/login", env.NEXTAUTH_URL));
    }

    const token = {
        sub: id,
        name,
        picture: avatar,
        role: (role === "ADMIN" ? "ADMIN" : "PLAYER") as "ADMIN" | "PLAYER",
        termsAcceptedAt,
        createdAt,
        accessToken,
        refreshToken,
        accessTokenExpiry: Date.now() + REFRESH_AGE,
    };

    const encoded = await encode({ token, secret: SECRET, maxAge: COOKIE_MAX_AGE });

    const response = NextResponse.redirect(new URL("/", env.NEXTAUTH_URL));
    response.cookies.set(SESSION_COOKIE_NAME, encoded, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: SECURE_COOKIE,
        maxAge: COOKIE_MAX_AGE,
    });

    return response;
}
