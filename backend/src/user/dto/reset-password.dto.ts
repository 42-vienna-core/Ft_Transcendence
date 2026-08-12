import { IsNotEmpty, IsString, MinLength, MaxLength, IsEmail } from 'class-validator';

export class ResetPasswordDto {

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    "email": string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    "password": string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    "ConfirmPassword": string;
}