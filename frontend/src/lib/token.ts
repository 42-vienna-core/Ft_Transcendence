import type { JWT } from 'next-auth/jwt';

const env = process.env;

export const REFRESH_URL = `${env.INTERNAL_API_URL}/auth`;
export const SECRET = env.NEXTAUTH_SECRET as string;
export const SECURE_COOKIE = env.NEXTAUTH_URL?.startsWith('https://') ?? !!env.VERCEL;
export const SESSION_COOKIE_NAME = `${SECURE_COOKIE ? '__Secure-' : ''}next-auth.session-token`;

const rawAccessTTL = env.JWT_ACCESS_TTL?.match(/\d+/)?.[0] || '15';
const rawRefreshTTL = env.JWT_REFRESH_TTL?.match(/\d+/)?.[0] || '7';

export const JWT_ACCESS_TTL = Number(rawAccessTTL);
export const JWT_REFRESH_TTL = Number(rawRefreshTTL);

export const REFRESH_AGE = (JWT_ACCESS_TTL - 2) * 60 * 1000;
export const COOKIE_MAX_AGE = JWT_REFRESH_TTL * 24 * 60 * 60;

export function createExpiredTime(): number {
    return Date.now() + REFRESH_AGE;
}

export async function refreshAccessToken(token: JWT): Promise<JWT> {
    try {
        const res = await fetch(`${REFRESH_URL}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
            cache: 'no-store'
        });

        if (!res.ok) {
            return { ...token, error: 'RefreshAccessTokenError' };
        }

        const data = await res.json();

        return {
            ...token,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpiry: createExpiredTime(),
            error: undefined
        };
    } catch (error) {
        return { ...token, error: 'RefreshAccessTokenError' };
    }
}
