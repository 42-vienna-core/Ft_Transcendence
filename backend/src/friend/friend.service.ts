import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
// import { CreateFriendDto } from './dto/create-friend.dto';
// import { UpdateFriendDto } from './dto/update-friend.dto';

@Injectable()
export class FriendService {
  
  constructor (private readonly db: DatabaseService) {}

  async findAll() {
    return await this.db.friends.findMany();
  }

  async findOne(id: number) {
    return id
  }

  update(id: number) {
    return `This action updates a #${id} friend`;
  }

  remove(id: number) {
    return `This action removes a #${id} friend`;
  }
}
