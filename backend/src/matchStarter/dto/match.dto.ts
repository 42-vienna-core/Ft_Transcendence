import { IsDefined, IsEnum, IsInt, IsUUID, ValidateIf } from "class-validator"

export enum MatchMode {
	CPU = 'CPU',
	QUICK = 'QUICK',
	FRIEND_INV = 'FRIEND_INV',
	FRIEND_JOIN = 'FRIEND_JOIN'
}

export class MatchRequestDto{
	@IsEnum(MatchMode)
	"mode": MatchMode;

	@ValidateIf((request: MatchRequestDto) => request.mode === MatchMode.FRIEND_INV)
	@IsDefined()
	@IsInt()
	friendId?: number;

	@ValidateIf((request: MatchRequestDto) => request.mode === MatchMode.FRIEND_JOIN)
	@IsDefined()
	@IsUUID()
	roomId?: string;
}