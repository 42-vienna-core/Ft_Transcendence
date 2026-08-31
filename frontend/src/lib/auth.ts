import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials'

const env = process.env;
const rawAccessTTL = env.JWT_ACCESS_TTL?.match(/\d+/)?.[0] || '15';
const JWT_ACCESS_TTL = Number(rawAccessTTL);
const REFRESH_AGE = (JWT_ACCESS_TTL - 2) * 60 * 1000;

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

                console.log(data);
                return {
                    id: data.user.id,
                    name: data.user.name,
                    email: payload.email,
                    avatar: data.user.avatar,
                    role: data.user.role,
                    accessToken: data.accessToken,
                    refreshToken: data.refreshToken,
                    accessTokenExpiry: createExpiredTime(),
                    termsAcceptedAt: data.user.termsAcceptedAt,
                    createdAt: data.user.createdAt,
                    level: data.user.level
                }
            },
        })
    ],
    callbacks: {
        async jwt({token, user, trigger, session}) {
            console.log("=================JWT CALLBACK=======================")
            if (user) {
                token.sub = user.id;
                token.name = user.name;
                token.email = user.email;
                token.picture = user.avatar;
                token.level = user.level;
                token.role = user.role;
                token.createdAt = user.createdAt;
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken;
                token.accessTokenExpiry = user.accessTokenExpiry;
                token.termsAcceptedAt = user.termsAcceptedAt ?? null;
            } else if (!token.role) {
                token.role = "PLAYER";
            }

            if (trigger === "update" && session) {
                const newUsername = session.username ?? session.user?.username;
                const newAvatar = session.avatar ?? session.user?.avatar;

                if (newUsername) token.name = newUsername;
                if (newAvatar) token.picture = newAvatar;
                if (session.termsAcceptedAt !== undefined)
                    token.termsAcceptedAt = session.termsAcceptedAt;
            }

            return token;
        },
        async session({session, token}) {
            console.log("=================SESSION CALLBACK=======================")
            if (session.user) {
                session.user.id = Number(token.sub);
                session.user.username = token.name as string;
                session.user.avatar = token.picture as string | null;
                session.user.level = token.level as number;
                session.user.createdAt = token.createdAt as string | null;;
                session.user.role = token.role;
                session.user.termsAcceptedAt = (token.termsAcceptedAt ?? null) as string | null;
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
    secret: process.env.NEXTAUTH_SECRET
}

