import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        accessToken: string;
        error?: string;
        user: {
            id: string;
            email: string;
            username: string;
        };
    }
    interface User {
        accessToken: string;
        refreshToken: string;
        accessTokenExpiry: number;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        accessToken: string;
        refreshToken: string;
        accessTokenExpiry: number;
        error?: string;
    }
}
