import { Controller, Body, Post } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
    constructor(private readonly roomService: RoomService) {}

    @Post()
    async createRoom(@Body() dto: CreateRoomDto) {
        return this.roomService.createRoom(dto);
    }
}
