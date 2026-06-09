import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUserDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(40)
    username!: string;
}
