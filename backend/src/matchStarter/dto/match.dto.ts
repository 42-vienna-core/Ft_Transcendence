import { IsDefined, IsEnum, IsUUID, ValidateIf } from "class-validator"

export enum MatchMode {
	CPU = 'CPU',
	QUICK = 'QUICK',
	FRIENDS = 'FRIENDS',
	FRIENDS_JOIN = 'FRIENDS_JOIN'
}

export class MatchRequestDto{
	@IsEnum(MatchMode)
	"mode": MatchMode;

	@ValidateIf((request: MatchRequestDto) => request.mode === MatchMode.FRIENDS_JOIN)
	@IsDefined()
	@IsUUID()
	roomId?: string;
}