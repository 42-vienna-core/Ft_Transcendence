import { IsString, IsNotEmpty, MinLength, MaxLength,  } from 'class-validator';

export class ResetCodeDto {
    @IsString()  @IsNotEmpty()
    email!: string;

    @IsString()  @IsNotEmpty()
    @MinLength(6) @MaxLength(6)
    code! : string;
}
