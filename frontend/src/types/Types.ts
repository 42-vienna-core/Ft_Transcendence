export interface AuthType {
    accessToken: string, refreshToken: string
}
export interface UserSearch {
    Username: string,
    id: number
}

export type UserType = {
    id: number;
    Username: string,
    role: string,
} | null;

export type UserContextType = {
    cntUser: UserType,
    setCntUser: React.Dispatch<React.SetStateAction<UserType>>;
    refreshUser: () => Promise<void>;
}