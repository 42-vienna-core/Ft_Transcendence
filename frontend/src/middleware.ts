import createIntlMiddleware from 'next-intl/middleware';
import { withAuth } from 'next-auth/middleware';
import { NextResponse, NextRequest } from 'next/server';

const locales = ['en', 'ru', 'de', 'it'];

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'en',
});

const authMiddleware = withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    
    const response = intlMiddleware(req);

    if (path.includes('/api/auth/session')) {
      response.headers.set('x-nextauth-origin', 'client-use-session');
    } else {
      response.headers.set('x-nextauth-origin', 'server-get-session');
    }

    const isAuthPage = /^\/(ru|en|de|it)?\/?(login|register)$/.test(path);

    if (token?.error === 'RefreshAccessTokenError') {
      if (!isAuthPage) {
        const currentLocale = path.split('/')[1] || 'en';
        const localePrefix = locales.includes(currentLocale) ? `/${currentLocale}` : '';
        return NextResponse.redirect(new URL(`${localePrefix}/login`, req.url));
      }
      return response;
    }

    if (token && isAuthPage) {
      const currentLocale = path.split('/')[1] || 'en';
      const localePrefix = locales.includes(currentLocale) ? `/${currentLocale}` : '';
      return NextResponse.redirect(new URL(`${localePrefix}/dashboard`, req.url));
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
    '/dashboard/:path*', 
    '/(ru|en|de|it)/:path*',
  ],
};
