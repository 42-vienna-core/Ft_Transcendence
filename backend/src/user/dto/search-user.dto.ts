import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class SearchUserDto {
    @Transform(({ value }) => value?.trim())
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(40)
    name!: string;
}