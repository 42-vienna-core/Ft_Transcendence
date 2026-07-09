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


export type OnlieList = {
    userId: number;
    Username: string,
    role: string,
}

export type PlayerRoomData = {
	players: number;
	roomId: string;
	roomStatus: string;

};