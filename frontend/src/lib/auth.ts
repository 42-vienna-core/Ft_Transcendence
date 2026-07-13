import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials'

const env = process.env;
const rawAccessTTL = env.JWT_ACCESS_TTL?.match(/\d+/)?.[0] || '15';
const JWT_ACCESS_TTL = Number(rawAccessTTL);
const REFRESH_AGE = (JWT_ACCESS_TTL - 1) * 60 * 1000;

const URL = `${env.INTERNAL_API_URL}/auth`;

function createExpiredTime(): number {
    return (Date.now() + REFRESH_AGE);
}

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

                if (!res.ok) throw new Error('Error: while logining');
                const data = await res.json();

                return {
                    id: data.user.id,
                    name: data.user.name,
                    email: payload.email,
                    avatar: data.user.avatar,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    accessTokenExpiry: createExpiredTime()
                }
            },
        })
    ],
    callbacks: {
        async jwt({token, user, account, trigger, session}) {
            console.log("=================JWT CALLBACK=======================")
            // console.log(" jwt calback: ",token);

            if (user) {
                token.sub = user.id;
                token.name = user.name;
                token.email = user.email;
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

            return token;
        },
        async session({session, token}) {
            console.log("=================SESSION CALLBACK=======================")

            // console.log(" session calback: ",token);

            if (session.user) {
                session.user.id = Number(token.sub);
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

