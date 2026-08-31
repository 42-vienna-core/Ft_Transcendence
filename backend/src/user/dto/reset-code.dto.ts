import { IsString, IsNotEmpty,  } from 'class-validator';

export class ResetCodeDto {
    @IsString()  @IsNotEmpty()
    "email": string;

    @IsString()  @IsNotEmpty()
    "code" : string;
}
