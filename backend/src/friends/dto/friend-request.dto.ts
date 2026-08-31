import { IsInt, Min } from "class-validator";

export class FriendRequestDto{
	@IsInt()
	@Min(1)
	receiverId!: number;
}