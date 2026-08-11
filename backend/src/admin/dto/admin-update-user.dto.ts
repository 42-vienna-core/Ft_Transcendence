import { IsIn, IsOptional } from "class-validator";

export class AdminUpdateUserDto  {

    @IsOptional()
    // @IsString()
    // @MinLength(3)
    // @MaxLength(40)
    "name"?: string;

    @IsOptional()
    // @IsString()
    // @MinLength(8)
    "password"?: string;

    @IsOptional()
    // @IsString()
    // @MinLength(8)
    "email"?: string;

    @IsOptional() @IsIn(["ADMIN", "PLAYER", "BOT"])
    "role": "ADMIN" | "PLAYER" | "BOT";
}
