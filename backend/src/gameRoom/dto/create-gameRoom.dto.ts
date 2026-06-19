import { IsString, IsEmpty, IsEnum, IsNumber } from 'class-validator';
export class CreateGameRoomDto {
  @IsString()
  @IsEmpty()
  'name': string;
  
  @IsNumber()
  'maxUsers': number;

  @IsEmpty()
  @IsEnum(['PRIVATE', 'PUBLIC'], {
    message: 'Valid role required',
  })
  'type': 'PRIVATE' | 'PUBLIC';
}
