import { IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterRequest {

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(40)
    username!: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+$/, {
            message: 'Weak password',
    })
    password!: string;
}
