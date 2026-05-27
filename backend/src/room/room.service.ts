import { Injectable } from "@nestjs/common";
import { DatabaseService } from "src/database/database.service";
import {CreateRoomDto} from "./dto/create-room.dto"
import { RoomGateway } from "./room.gateway";

@Injectable()
export class RoomService {
    constructor (
        private db: DatabaseService,
        private roomGateway: RoomGateway

    ) {}

    async createRoom(dto: CreateRoomDto) {
        const room = await this.db.room.create({
            data: {
                name: dto.name,
                maxUsers: dto.maxUsers,
            }
        });
        this.roomGateway.server.emit("room_created", room);
        return room;
    }

    async  findAll() {
        const res = await this.db.room.findMany();
        
        return res;
    }

    async deleteRoom(name: string)
    {
        const res = await this.db.room.deleteMany({
            where: {
                name,
            }
        })
        console.log(res);
        return res;
    }
}