'use server';

import { cookies, headers } from 'next/headers';
import { encode, getToken, type JWT } from 'next-auth/jwt';
import { refreshAccessToken } from './auth';

interface CustomApiOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  isRetry?: boolean; 
}

const SECRET = process.env.NEXTAUTH_SECRET as string;
const SECURE_COOKIE = process.env.NEXTAUTH_URL?.startsWith('https://') ?? !!process.env.VERCEL;
const SESSION_COOKIE_NAME = `${SECURE_COOKIE ? '__Secure-' : ''}next-auth.session-token`;
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;


async function readToken(): Promise<JWT | null> {
  const cookieStore = await cookies();
  const requestHeaders = await headers();

  return getToken({

    req: { cookies: cookieStore, headers: requestHeaders } as any,
    secret: SECRET,
    secureCookie: SECURE_COOKIE,
  });
}

async function persistToken(token: JWT) {
  const encoded = await encode({ token, secret: SECRET, maxAge: SESSION_MAX_AGE });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, encoded, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: SECURE_COOKIE,
    maxAge: SESSION_MAX_AGE,
  });
}


async function getValidToken(): Promise<JWT> {
  const token = await readToken();
  if (!token || token.error === 'RefreshAccessTokenError') {
    throw new Error('RefreshAccessTokenError');
  }

  const expiry = (token.accessTokenExpiry as number) ?? 0;
  if (Date.now() < expiry) {
    return token;
  }

  const refreshed = await refreshAccessToken(token);
  await persistToken(refreshed);
  if (refreshed.error) {
    throw new Error('RefreshAccessTokenError');
  }
  return refreshed;
}

export async function apiFetch(endpoint: string, options: CustomApiOptions = {}): Promise<any> {
  console.log("========================apiFetch============================");
  const baseUrl = process.env.INTERNAL_API_URL;
  const url = `${baseUrl}/${endpoint}`;

  console.log(url);

  const token = await getValidToken();

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token.accessToken}`);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, {...options, headers, cache: 'no-store' });

  let data: any = null;
  const contentType = res.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text().catch(() => null);
  }


  if (res.status === 401 && !options.isRetry) {
    const refreshed = await refreshAccessToken(token);
    await persistToken(refreshed);
    if (refreshed.error) {
      throw new Error('RefreshAccessTokenError');
    }

    return apiFetch(endpoint, { ...options, isRetry: true });
  }

  if (!res.ok) {
    const errorMessage = data?.message || data?.error || `Request failed with status ${res.status}`;
    throw new Error(errorMessage);
  }

  return data;
}
