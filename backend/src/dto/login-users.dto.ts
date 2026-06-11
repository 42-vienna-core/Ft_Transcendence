import { IsEmail, IsNotEmpty} from "class-validator";

export class LoginUsersDto {
    @IsEmail()
    "Email": string;

     @IsNotEmpty()
    "Password": string;
}