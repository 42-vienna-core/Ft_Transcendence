import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MatchStarter } from './matchStarter.service';
import { GameRoomModule } from 'src/gameRoom/gameRoom.module';
import { GameModule } from 'src/game/game.module';
import { RedisModule } from 'src/redis/redis.module';
import { FriendsModule } from 'src/friends/friends.module';

@Module({
	imports: [PrismaModule, GameRoomModule, GameModule, RedisModule, FriendsModule],
	providers: [MatchStarter],
	exports: [MatchStarter],
})
export class MatchModule {}