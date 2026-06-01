import { IsString, IsEmpty, IsEnum, IsNumber } from 'class-validator';
export class CreatePrivateRoom {
  @IsString()
  @IsEmpty()
  'name': string;

  @IsNumber()
  'maxUsers': number;

  @IsEmpty()
  @IsNumber()
  'ownerId': number;

  @IsEmpty()
  @IsEnum(['PRIVATE', 'PUBLIC'], {
    message: 'Valid role required',
  })
  'type': 'PRIVATE' | 'PUBLIC';
}
