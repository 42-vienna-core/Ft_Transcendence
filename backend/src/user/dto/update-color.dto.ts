import { IsIn, IsNotEmpty, IsString } from "class-validator";

const SNAKE_COLORS = [
	'#39FF14',
	'#00E5FF',
	'#FF007F',
	'#FFEA00',
	'#9D00FF',
	'#FF5E00',
	'#FFFFFF',
];

export class UpdateColorDto{
	@IsNotEmpty()
	@IsString()
	@IsIn(SNAKE_COLORS)
	color!: string;
}