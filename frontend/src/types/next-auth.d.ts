import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        accessToken: string;
        error?: string;
        user: {
            id: number;
            email: string;
            username: string;
            avatar: string | null;
            role: "ADMIN" | "PLAYER";
            termsAcceptedAt: string | null;
            createdAt: string | null;
            level: number;
        };
    }
    interface User {
        avatar: string,
        accessToken: string;
        refreshToken: string;
        accessTokenExpiry: number;
        role: "ADMIN" | "PLAYER" ;
        termsAcceptedAt: string | null;
        createdAt: string | null;
        level: number;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken: string;
        refreshToken: string;
        accessTokenExpiry: number;
        role: "ADMIN" | "PLAYER";
        termsAcceptedAt?: string | null;
        error?: string;
    }
}
