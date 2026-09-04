import createIntlMiddleware from 'next-intl/middleware';
import { withAuth } from 'next-auth/middleware';
import { NextResponse, NextRequest } from 'next/server';
import { encode } from 'next-auth/jwt';
import { refreshAccessToken, SECRET, SECURE_COOKIE, SESSION_COOKIE_NAME, COOKIE_MAX_AGE } from './lib/token';

const locales = ['en', 'ru', 'de', 'it'];

const intlMiddleware = createIntlMiddleware({
    locales,
    defaultLocale: 'en',
});

const authMiddleware = withAuth(
    async function middleware (req) {
        const path = req.nextUrl.pathname;

        if (path.startsWith('/api/auth')) {
            return NextResponse.next();
        }

        const response = intlMiddleware(req);
        
        const token = req.nextauth.token;
    
        const isAuthPage = /^\/(ru|en|de|it)?\/?(login|register)$/.test(path);

        if (token) {
            const expiry = (token.accessTokenExpiry as number) ?? 0;
            const isExpired = Date.now() > expiry;

            if (isExpired) {
                const refreshed = await refreshAccessToken(token);

                if (refreshed?.error === 'RefreshAccessTokenError') {
    
                    const currentLocale = path.split('/')[1] || 'en';
                    const localePrefix = locales.includes(currentLocale) ? `/${currentLocale}` : '';
    
                    let finalResponse: NextResponse;
    
                    if (!isAuthPage) {
                        finalResponse = NextResponse.redirect(new URL(`${localePrefix}/login`, req.url));
                    } else {
                        finalResponse = response;
                    }

                    finalResponse.cookies.set(SESSION_COOKIE_NAME, '', {
                        path: '/',
                        maxAge: 0,
                        expires: new Date(0),
                        httpOnly: true,
                        secure: SECURE_COOKIE,
                        sameSite: 'lax'
                    });

                    req.cookies.set(SESSION_COOKIE_NAME, '');
                    return finalResponse;
                }


                const encoded = await encode({ token: refreshed, secret: SECRET, maxAge: COOKIE_MAX_AGE });
                
                response.cookies.set(SESSION_COOKIE_NAME, encoded, {
                    httpOnly: true,
                    sameSite: 'lax',
                    path: '/',
                    secure: SECURE_COOKIE,
                    maxAge: COOKIE_MAX_AGE,
                });

                req.cookies.set(SESSION_COOKIE_NAME, encoded);
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
                const isPublicPath = /^\/(ru|en|de|it)?\/?(login|register|reset-password|privacy|terms)?$/.test(path);
                if (isPublicPath) return true;
                return !!token;
            }
        }
    }
);

export default function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;

    if (path.startsWith('/api/auth') || path.startsWith('/api/admin')) {
        return NextResponse.next();
    }

    return (authMiddleware as any)(req);
}

export const config = {
    matcher: [
        '/((?!api/v1|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|mp3)$).*)',
        '/(ru|en|de|it)/((?!sounds|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css|mp3)$).*)',
        '/arena/:path*', 
        '/friends/:path*', 
        '/profile/:path*',
    ],
};
