import { IsString, IsEmpty, IsNumber } from 'class-validator';

export class AddUserGameRoomDto {
    @IsEmpty() @IsString()
    "roomId": string
    @IsEmpty() @IsNumber()
    "userId": number
}