import { NextAuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials'

const URL = `${process.env.INTERNAL_API_URL}/auth`;

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: {label: 'Email', type: 'email'},
                password: {label: 'Password', type: 'password'},
            },

            async authorize(credentials) {
                const payload = {
                    email: credentials?.email,
                    password: credentials?.password,
                }

                const res = await fetch(`${URL}/login`, {
                    method: 'POST',
                    body: JSON.stringify(payload),
                    headers: {'Content-Type': 'application/json'},
                    cache: 'no-store'
                })

                if (!res.ok) return null;
                const data = await res.json();
                console.log(data);

                return {
                    id: data.user.id,
                    name: data.user.name,
                    avatar: data.user.avatar,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    accessTokenExpiry: createExpiredTime()
                }
            },
        })
    ],
    callbacks: {
        async jwt({token, user, trigger, session}) {
            console.log("=================JWT CALLBACK=======================")
            console.log("CHECK user: ", user);
            console.log("CHECK jwt accessToken: ", token.accessToken);

            console.log("CHECK jwt refreshToken: ", token.refreshToken);

            if (user) {
                token.sub = user.id;
                token.name = user.name;
                token.picture = user.avatar;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.accessTokenExpiry = user.accessTokenExpiry;
            }

            if (trigger === "update" && session) {
                const newUsername = session.username ?? session.user?.username;
                const newAvatar = session.avatar ?? session.user?.avatar;

                if (newUsername) token.name = newUsername;
                if (newAvatar) token.picture = newAvatar;
            }

            const expiryTime = (token.accessTokenExpiry as number) ?? 0;
            if (Date.now() < expiryTime) {
                return token;
            }

            return await refreshAccessToken(token);
        },
        async session({session, token}) {
            if (session.user) {
                session.user.id = token.sub as string;
                session.user.username = token.name as string;
                session.user.avatar = token.picture as string | null;
            }

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
    console.log("================= REFRESH JWT=======================")
    console.log("CHECK jwt accessToken: ", token.accessToken);

    console.log("CHECK jwt refreshToken: ", token.refreshToken);
    console.log("act refresh token");
    console.log(`${URL}/refresh`);
    try {
        const res = await fetch(`${URL}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
            cache: 'no-store' 
        });

        if (!res.ok) 
            throw new Error('refresh faild');

        const data = await res.json();
        console.log("data",data);

        const payload = {
            // ...token,
            ...data,
            accessTokenExpiry: createExpiredTime(),
            error: undefined
        }
        console.log("payload",payload);

        return payload;
    } catch (error){
        console.error("❌ Token rotation failure:", error);
        return {...token, error: 'RefreshAccessTokenError'};
    }
}

function createExpiredTime(): number {
    return (Date.now() + 1 * 60 * 1000);
}