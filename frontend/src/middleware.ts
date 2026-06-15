import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;
        const response = NextResponse.next();
        const isAuthPage = path === "/login" || path === "/register";

        if (path === '/api/auth/session') {
            response.headers.set('x-nextauth-origin', 'client-use-session');
        } else {
            response.headers.set('x-nextauth-origin', 'server-get-session');
        }

        if (token?.error === 'RefreshAccessTokenError') {
            return isAuthPage ? response : NextResponse.redirect(new URL('/login', req.url));
        }

        if (token && isAuthPage) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        return response;
    },
    {
        callbacks: {
            authorized: ({token, req }) => {
                const path = req.nextUrl.pathname;
                const publicPath = ['/', '/login', '/register'];
                if (publicPath.includes(path)) return true;
                return !!token;
            }
        }
    }
);

export const config = {
    matcher: [
    '/((?!api/v1|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css)$).*)',
    "/dashboard/:path*",
  ],
};