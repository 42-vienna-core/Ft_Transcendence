import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;
        
        if (token && (path === "/login" || path === "/register") ) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        // if (token?.error === 'RefreshAccessTokenError') {
        //     return NextResponse.redirect(new URL('/login?error=session_expired', req.url));
        // }

        return NextResponse.next();
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