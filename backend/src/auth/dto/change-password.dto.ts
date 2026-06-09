import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class ChangePasswordDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    oldPassword!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    // todo Matches with frontend
    @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+$/, {
        message: 'Weak password',
    })
    newPassword!: string;
}
