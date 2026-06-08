import { IsEmail, IsEnum , IsNotEmpty, IsString} from "class-validator";

export class CreateUserDto {
    @IsString() @IsNotEmpty()
    "name": string;

    @IsEmail()
    "email": string;

    @IsNotEmpty()
    "password": string;

    "resetCode": string;
    
    "codeExpire": Date;

    @IsEnum(["ADMIN" , "PLAYER"], {
        message: "Valid role required"
    })
    "role": "ADMIN" | "PLAYER";
}

export class CreateLoginDto {
    @IsEmail()
    "email": string;

     @IsNotEmpty()
    "password": string;
}

