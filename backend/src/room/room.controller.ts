import { Controller, Body, Post, Get, Delete, Param } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
    constructor(private readonly roomService: RoomService) {}

    @Get()
    findAll() {
        return this.roomService.findAll();
    }

    @Post()
    async createRoom(@Body() obj: CreateRoomDto) {
        return this.roomService.createRoom(obj);
    }
    
    @Delete(':id')
    async deleteRoom(@Param('id') id: string)
    {
        return await this.roomService.deleteRoom(id);
    }
}
