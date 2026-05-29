import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        console.log(token);
        
        const isAuthPage =  req.nextUrl.pathname.startsWith('/login') ||
                            req.nextUrl.pathname.startsWith('/register');
        
        if (isAuthPage && token) {
            return NextResponse.redirect(new URL('/dashboard', req.url));
        }

        if (token?.error === 'RefreshAccessTokenError') {
            return NextResponse.redirect(new URL('/login?error=session_expired', req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({token, req }) => {
                const publicPath = ['/', '/login', '/register'];
                if (publicPath.includes(req.nextUrl.pathname)) return true;
                return !!token;
            }
        }
    }
);

export const config = {
    matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|css)$).*设计*)',
  ],
};