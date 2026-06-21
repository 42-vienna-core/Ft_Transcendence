import { Controller, Body, Post, Get, Delete, Param } from '@nestjs/common';
import { CreateGameRoomDto } from '../dto/create-gameRoom.dto';
import { CreatePrivateGameRoom } from '../dto/crate-private-gameRoom.dto';
import { GameRoomService } from './gameRoom.service';

@Controller('gameRoom')
export class GameRoomController {
  constructor(private readonly roomService: GameRoomService) {}

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  
  @Post()
  async createRoom(@Body() obj: CreateGameRoomDto) {
    return this.roomService.createRoom(obj);
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
