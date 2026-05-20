import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomGateway } from './room.gateway';
import { RoomController } from './room.controller';
import  {DatabaseModule} from "src/database/database.module"

@Module({
  imports: [DatabaseModule],
  providers: [RoomService, RoomGateway],
  controllers: [RoomController]
})
export class RoomModule {}
