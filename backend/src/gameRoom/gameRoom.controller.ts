import { Controller, Body, Post, Get, Delete, Param, Query, ParseIntPipe} from '@nestjs/common';
import { CreatePrivateGameRoom } from '../dto/crate-private-gameRoom.dto';
import { GameRoomService } from './gameRoom.service';

@Controller('gameRoom')
export class GameRoomController {
  constructor(private readonly roomService: GameRoomService) {}

  @Get()
  findAll(@Query('status') Status?: 'WAITING' | 'PLAYING' | 'FINISHED') {
    return this.roomService.findAll(Status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }
  
  @Get("create/:id")
  async createRoom(@Param('id', ParseIntPipe) id:  number) {
    return this.roomService.createRoom(id);
  }

  @Post('private')
  async createPrivateRoom(@Body() obj: CreatePrivateGameRoom) {
    return this.roomService.createPrivateRoom(obj);
  }

  @Delete(':id')
  async deleteRoom(@Param('id') id: string) {
    return await this.roomService.deleteRoom(id);
  }
}
