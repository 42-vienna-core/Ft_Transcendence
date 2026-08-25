import { create } from 'zustand'
import { devtools } from 'zustand/middleware';


interface UserData {
    id: number;
    username: string;
    email: string;
    nameOnChange: string;
    avatar: string | null;
    status: 'loading' | 'authenticated' | 'unauthenticated';
    role: "ADMIN" | "PLAYER";
}

interface ProfileData {
    profile: UserData | null;

    setNameOnChange: () => void;
    setAvatar: (newUrl: string) => void;
}


export const useProfileStore = create<ProfileData>()(
    devtools((set, get) => ({
        profile: null,

        setNameOnChange: () => {},
        setAvatar: (newUrl: string) => {},
    })
));