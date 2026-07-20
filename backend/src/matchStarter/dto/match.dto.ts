import { IsEnum } from "class-validator"

export enum MatchMode {
	CPU = 'CPU',
	QUICK = 'QUICK',
	FRIENDS = 'FRIEND',
}

export class StartMatchDto{
	@IsEnum(MatchMode)
	"mode": MatchMode;
}