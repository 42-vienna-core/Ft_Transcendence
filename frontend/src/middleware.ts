import createIntlMiddleware from 'next-intl/middleware';
import { withAuth } from 'next-auth/middleware';
import { NextResponse, NextRequest } from 'next/server';
import { encode, getToken, type JWT } from 'next-auth/jwt';

const locales = ['en', 'ru', 'de', 'it'];

const env = process.env;
const REFRESH_URL = `${env.INTERNAL_API_URL}/auth`;
const SECRET = env.NEXTAUTH_SECRET as string;
const SECURE_COOKIE = env.NEXTAUTH_URL?.startsWith('https://') ?? !!env.VERCEL;
const SESSION_COOKIE_NAME = `${SECURE_COOKIE ? '__Secure-' : ''}next-auth.session-token`;

const rawAccessTTL = env.JWT_ACCESS_TTL?.match(/\d+/)?.[0] || '15';
const rawRefreshTTL = env.JWT_REFRESH_TTL?.match(/\d+/)?.[0] || '7';

const JWT_ACCESS_TTL = Number(rawAccessTTL);
const JWT_REFRESH_TTL = Number(rawRefreshTTL);

const REFRESH_AGE = Number(JWT_ACCESS_TTL) * 60 * 1000;
const COOKIE_MAX_AGE = Number(JWT_REFRESH_TTL) * 24 * 60 * 60;

function createExpiredTime(): number {
    return Date.now() + REFRESH_AGE;
}

export async function refreshAccessToken(token: JWT): Promise<JWT> {
    console.log("================= REFRESH JWT=======================")

    try {
        const res = await fetch(`${REFRESH_URL}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
            cache: 'no-store' 
        });

        if (!res.ok) {
            return {...token, error: "RefreshAccessTokenError" }
        }

        const data = await res.json();

        return {
            ...token,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpiry: createExpiredTime(),
            error: undefined
        }
    } catch (error){
        return {...token, error: "RefreshAccessTokenError" }
    }
}

const intlMiddleware = createIntlMiddleware({
    locales,
    defaultLocale: 'en',
});


const authMiddleware = withAuth(
    async function middleware (req) {
        const path = req.nextUrl.pathname;
        const response = intlMiddleware(req);

        const token = await getToken({
            req, 
            secret: SECRET,
            secureCookie: SECURE_COOKIE
        });
    
        const isAuthPage = /^\/(ru|en|de|it)?\/?(login|register)$/.test(path);

        if (token) {
            const expiry = (token.accessTokenExpiry as number) ?? 0;
            const isExpired = Date.now() > expiry;

            if (isExpired) {
                const refreshed = await refreshAccessToken(token);

                if (refreshed?.error === 'RefreshAccessTokenError') {
                    if (!isAuthPage) {
                        const currentLocale = path.split('/')[1] || 'en';
                        const localePrefix = locales.includes(currentLocale) ? `/${currentLocale}` : '';
                        return NextResponse.redirect(new URL(`${localePrefix}/login`, req.url));
                    }
                    return response;
                }

                const encoded = await encode({ token: refreshed, secret: SECRET, maxAge: COOKIE_MAX_AGE });
                
                response.cookies.set(SESSION_COOKIE_NAME, encoded, {
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    secure: SECURE_COOKIE,
                    maxAge: COOKIE_MAX_AGE,
                });
                
            }    

            if (isAuthPage) {
                const currentLocale = path.split('/')[1] || 'en';
                const localePrefix = locales.includes(currentLocale) ? `/${currentLocale}` : '';
                return NextResponse.redirect(new URL(`${localePrefix}/`, req.url));
            }    
        }
        return response;
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname;
                if (path.startsWith('/api/auth')) return true;
                const isPublicPath = /^\/(ru|en|de|it)?\/?(login|register)?$/.test(path);
                if (isPublicPath) return true;
                return !!token;
            }
        }
    }
);

export default function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    if (path.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    return (authMiddleware as any)(req);
}

export const config = {
    matcher: [
        '/((?!api/v1|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css)$).*)',
        '/(ru|en|de|it)/:path*',
        '/arena/:path*', 
        '/friends/:path*', 
        '/profile/:path*',
    ],
};
