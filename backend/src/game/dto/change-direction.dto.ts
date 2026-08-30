import { IsIn } from "class-validator";
import type { Direction } from "../interfaces/game-state";

export class ChangeDirectionDto{
	@IsIn(['UP', 'DOWN', 'LEFT', 'RIGHT'])
	direction!: Direction;
}