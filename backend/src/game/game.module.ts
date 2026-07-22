import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { AiModule } from 'src/aiOpponent/ai.module';

@Module({
	imports: [PrismaModule, RedisModule, AiModule],
    providers: [GameService, GameGateway],
	exports: [GameService],
})
export class GameModule {}
