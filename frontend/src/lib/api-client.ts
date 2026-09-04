'use server';

import { getToken, encode } from 'next-auth/jwt';
import { cookies, headers } from 'next/headers';
import type { NextRequest } from 'next/server';
import { refreshAccessToken, SECRET, SECURE_COOKIE, SESSION_COOKIE_NAME, COOKIE_MAX_AGE } from './token';

interface CustomApiOptions extends RequestInit {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

async function getValidAccessToken(): Promise<string | undefined> {
    const cookieStore = await cookies();
    const headerStore = await headers();

    const token = await getToken({
        req: { cookies: cookieStore, headers: headerStore } as unknown as NextRequest,
        secret: SECRET,
        cookieName: SESSION_COOKIE_NAME,
    });

    if (!token) return undefined;

    const expiry = (token.accessTokenExpiry as number) ?? 0;
    if (Date.now() <= expiry) {
        return token.accessToken as string | undefined;
    }

    const refreshed = await refreshAccessToken(token);

    if (refreshed.error) {
        cookieStore.set(SESSION_COOKIE_NAME, '', {
            path: '/',
            maxAge: 0,
            expires: new Date(0),
            httpOnly: true,
            secure: SECURE_COOKIE,
            sameSite: 'lax'
        });
        return undefined;
    }

    const encoded = await encode({ token: refreshed, secret: SECRET, maxAge: COOKIE_MAX_AGE });
    cookieStore.set(SESSION_COOKIE_NAME, encoded, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: SECURE_COOKIE,
        maxAge: COOKIE_MAX_AGE,
    });

    return refreshed.accessToken as string | undefined;
}

export async function apiFetch(endpoint: string, options: CustomApiOptions = {}): Promise<any> {
    const baseUrl = process.env.INTERNAL_API_URL;
    const url = `${baseUrl}/${endpoint}`;

    const accessToken = await getValidAccessToken();

    const requestHeaders = new Headers(options.headers);
    requestHeaders.set('Authorization', `Bearer ${accessToken}`);

    if (options.body && !(options.body instanceof FormData)) {
        requestHeaders.set('Content-Type', 'application/json');
    }

    const res = await fetch(url, { ...options, headers: requestHeaders, cache: 'no-store' });

    let data: any = null;
    const contentType = res.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        data = await res.json();
    } else {
        data = await res.text().catch(() => null);
    }

    if (!res.ok) {
        const errorMessage = data?.message || data?.error || `Request failed with status ${res.status}`;
        throw new Error(errorMessage);
    }

    return data;
}
