export interface friendRequestData{
	receiverId: number;
	request: {
		id: string;
		sender: {
			id: number;
			name: string;
			avatar: string | null;
			isOnline: boolean;
			score: number;
		};
	};
}