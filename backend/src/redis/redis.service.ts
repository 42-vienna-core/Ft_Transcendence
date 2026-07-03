import { Injectable, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';


@Injectable()
export class RedisService implements OnModuleInit {
  private client!: RedisClientType;

  async onModuleInit() {
    this.client = createClient({ url: 'redis://localhost:6379' });

    this.client.on('error', (err) => {
      console.log('Redis Error:', err);
    });

    await this.client.connect();

    console.log('Redis Connected');
  }

  async addOnlineUser(userId: string, socketId: string) {
    await this.client.set(`user:online:${userId}`, socketId);
  }

  async removeOnlineUser(userId: number) {
    await this.client.del(`user:online:${userId}`);
  }

  async getOnlineUsers() {
    return await this.client.keys(`user:online:*`);
  }

  async setGameState(gameId: string, state: any ) {
    await this.client.set(`game:${gameId}:state`, JSON.stringify(state) );
  }

  async updatePlayerPosition(
    gameId: string, 
    userId: number, 
    position: {x: number, y: number} ) {
      await this.client.set(`game:${gameId}:player:${userId}:pos`, JSON.stringify(position))
  }

  async setGameWithTTL(gameId: string, state: any, ttlSeconds = 300) {
    await this.client.setEx(
      `game:${gameId}:state`,
      ttlSeconds,
      JSON.stringify(state)
    );
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

  /// Sessions 
  async addSessionToBlackList(sessionId: string): Promise<void> {
    await this.client.set(`session:blacklist:${sessionId}`, 'true'); //todo ttl
  }

  async isSessionBlacklisted(sessionId: string): Promise<boolean> {
    const isInBlackList = await this.client.exists(
      `session:blacklist:${sessionId}`,
    );
    return isInBlackList === 1;
  }

  async deleteSessionFromBlackList(sessionId: string): Promise<void> {
    await this.client.del(`session:blacklist:${sessionId}`);
  }
  
}
