import { IsEmail, IsNotEmpty, IsString, Matches} from "class-validator";

export class LoginRequest {
    @IsNotEmpty()
    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+$/, {
            message: 'Weak password',
    })
    password!: string;
}
