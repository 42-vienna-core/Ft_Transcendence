import { RoomStatus } from "@prisma/client";

export interface Match{
	roomId: string;
	roomStatus: RoomStatus;
	timer: number | null;
	players: {
		id: number;
		name: string;
		avatar: string | null;
		isOwner: boolean;
	}[];
}