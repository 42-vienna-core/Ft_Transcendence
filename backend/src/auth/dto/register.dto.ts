import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class RegisterRequest {

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(40)
    name!: string;


    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    password!: string;
}
