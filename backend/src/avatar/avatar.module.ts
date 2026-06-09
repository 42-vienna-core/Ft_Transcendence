import { Module } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { FileService } from './file/file.service';

@Module({
  providers: [AvatarService, FileService],
  exports: [AvatarService, FileService],
})
export class AvatarModule {}
