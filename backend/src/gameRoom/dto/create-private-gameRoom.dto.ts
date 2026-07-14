import { IsString, IsEmpty, IsEnum, IsNumber } from 'class-validator';
export class CreatePrivateGameRoom {
  @IsString()
  @IsEmpty()
  'name': string;

  @IsNumber()
  'maxUsers': number;

  @IsNumber()
  'ownerId': number;

  @IsEnum(['PRIVATE', 'PUBLIC'], {
    message: 'Valid role required',
  })
  'type': 'PRIVATE' | 'PUBLIC';
}
