import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials'

const BACKEND_URL = process.env.INTERNAL_API_URL;

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: {label: 'Email', type: 'email'},
                password: {label: 'Password', type: 'password'},
            },

            async authorize(credentials) {
                console.log(BACKEND_URL);

                const res = await fetch(`${BACKEND_URL}/auth/login`, {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: {'Content-Type': 'application/json'}
                })
                console.log("after fetching");
                if (!res.ok) return null;
                const data = await res.json();
                console.log(data);

                return {
                    id: data.user.id,
                    name: data.user.name,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    accessTokenExpiry: createExpiredTime()
                }
            },
        })
    ],
    callbacks: {
        async jwt({token, user}) {
            if (user) return {...token, ...user}
            
            if (Date.now() < (token.accessTokenExpiry as number)) return token;

            return await refreshAccessToken(token);
        },
        async session({session, token}) {
            session.user.id = token.id as string;
            session.user.username = token.name as string;
            session.accessToken = token.accessToken as string;
            session.error = token.error as string | undefined;
            return session;
        }
    },
    pages: {
        signIn: '/login',
        error: '/login'
    },
    session: {strategy: 'jwt'},
    debug: true,
    secret: process.env.NEXTAUTH_SECRET
}

async function refreshAccessToken(token: JWT): Promise<JWT> {
    console.log("refreshAccessToken");

    try {
        const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
            method: 'POST',
            body: JSON.stringify(token.refreshToken),
            headers: {'Content-Type': 'application/json'}
        });

        if (!res.ok) throw new Error('refresh faild');

        const data = await res.json();

        return {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpiry: createExpiredTime(),
            error: undefined
        }
    } catch {
        return {...token, error: 'RefreshAccessTokenError'};
    }
}

function createExpiredTime(): number {
    return (Date.now() + 14 * 60 * 1000);
}