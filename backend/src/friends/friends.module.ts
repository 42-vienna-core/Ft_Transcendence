import { Module } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendsController } from './friends.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
    imports: [PrismaModule, RedisModule],
    controllers: [FriendsController],
    providers: [FriendsService],
	exports: [FriendsService]
})
export class FriendsModule { }
