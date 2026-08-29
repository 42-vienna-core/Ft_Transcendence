import { IsNotEmpty, IsString, MinLength, MaxLength, IsEmail, Matches } from 'class-validator';

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
    @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+$/, {
        message: 'Weak password',
    })

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+$/, {
        message: 'Weak password',
    })
    "ConfirmPassword": string;
}