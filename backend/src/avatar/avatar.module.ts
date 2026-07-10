import { Module } from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { FileService } from './file/file.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [AvatarService, FileService],
  exports: [AvatarService, FileService],
})
export class AvatarModule {}
