import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';


@Injectable()
export class RedisService implements OnModuleInit {
  private client!: RedisClientType;

  async onModuleInit() {
    this.client = createClient({
      url: 'redis://localhost:6379',
    });

    this.client.on('error', (err) => {
      console.log('Redis Error:', err);
    });

    await this.client.connect();

    console.log('Redis Connected');
  }

  async set(key: string, value: string) {
    await this.client.set(key, value);
  }

  async get(key: string) {
    return await this.client.get(key);
  }

  async del(key: string) {
    await this.client.del(key);
  }

  async saveToken(userId: number, token: string) {
        await this.client.set(`token:${userId}`, token);
      }
  
    async getToken(userId: number) {
      return await this.client.get(`token:${userId}`);
    }

    async deleteToken(userId: number) {
      await this.client.del(`token:${userId}`);
    }

    async setEx(key: string, secound: number, value: string) {
      await this.client.setEx(key, secound, value);
    }
   
    async exists(key: string) {
      return await this.client.exists(key);
    }


}
