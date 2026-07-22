import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MatchStarter } from './matchStarter.service';
import { GameRoomModule } from 'src/gameRoom/gameRoom.module';
import { GameModule } from 'src/game/game.module';

@Module({
	imports: [PrismaModule, GameRoomModule, GameModule],
	providers: [MatchStarter],
	exports: [MatchStarter],
})
export class MatchModule {}