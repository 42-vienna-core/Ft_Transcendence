import { IsString, IsEnum, IsNumber, IsNotEmpty } from 'class-validator';
export class CreateGameRoomDto {
  @IsString()
  @IsNotEmpty()
  'name': string;
  
  @IsNumber()
  'maxUsers': number;

  @IsNotEmpty()
  @IsEnum(['PRIVATE', 'PUBLIC'], {
    message: 'Valid role required',
  })
  'type': 'PRIVATE' | 'PUBLIC';
}
