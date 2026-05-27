import { Controller, Body, Post, Get, Delete, Param } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
    constructor(private readonly roomService: RoomService) {}

    @Get()
    findAll() {
        return this.roomService.findAll();
    }

    @Post()
    async createRoom(@Body() dto: CreateRoomDto) {
        return this.roomService.createRoom(dto);
    }

    @Delete(':nmae')
    async deleteRoom(@Param('name') name: string)
    {
        return await this.roomService.deleteRoom(name);
    }
}
