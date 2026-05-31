import { Injectable } from '@nestjs/common';
// import { CreateFriendDto } from './dto/create-friend.dto';
// import { UpdateFriendDto } from './dto/update-friend.dto';

@Injectable()
export class FriendService {
  create(name: string) {
    console.log(name);
    return 'This action adds a new friend';
  }

  findAll() {
    return `This action returns all friend`;
  }

  findOne(id: number) {
    return `This action returns a #${id} friend`;
  }

  update(id: number) {
    return `This action updates a #${id} friend`;
  }

  remove(id: number) {
    return `This action removes a #${id} friend`;
  }
}
