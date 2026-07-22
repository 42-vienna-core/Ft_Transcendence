import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { GameState } from 'src/game/interfaces/game-state';
// import ms, { StringValue } from 'ms'; 

interface OnlineUsersData {
  id: number;
  name: string;
  avatar: string | null
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Redis;

  constructor(
    // private readonly configService: ConfigService,
  ) {
    const url = process.env.REDIS_URL || 'redis://redis:6379';
    this.client = new Redis(url);

    this.client.on('connect', () => {
      console.log('Redis connected');
    });

    this.client.on('error', (err) => {
      console.error('Redis error', err);
    });
  }

  async onModuleInit() {
    await this.client.ping();
    console.log("Redis init");
  }

  async onModuleDestroy() {
    await this.client.quit();
    console.log("Redis destroy");
  }

  //// ===========Socket GameRoom =========== /////////


  async addOnlineUser(data: OnlineUsersData, sessionId: string): Promise<boolean> {

    const key = `user:online:${data.id}:${sessionId}`;
    const oldSocketId = await this.get(key);
    await this.set(key, JSON.stringify(data));

    return !oldSocketId;
  }

  async removeOnlineUser(userId: number) {
    await this.del(`user:online:${String(userId)}`);
  }

  async getOnlineUsers(): Promise<OnlineUsersData[]> {
    const keys = await this.client.keys('user:online:*');
    if (keys.length === 0) return [];
    
    const values = await this.client.mget(keys);
    return values
      .filter((val): val is string => val !== null)
      .map((val) => JSON.parse(val) as OnlineUsersData);
  }

  async updatePlayerPosition(
    gameId: string, 
    userId: number, 
    position: {x: number, y: number} ) {
      await this.client.set(`game:${gameId}:player:${userId}:pos`, JSON.stringify(position))
  }

  async setGameWithTTL(gameId: string, state: any, ttlSeconds = 300) {
    await this.client.setex(
      `game:${gameId}:state`,
      ttlSeconds,
      JSON.stringify(state)
    );
  }

  async getGameState(gameId: string) : Promise<GameState | null> {
    const data = await this.get(`game:${gameId}:state`);
    if (!data)
      return null;
    return (JSON.parse(data));
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
    await this.client.setex(key, secound, value);
  }
  
  async exists(key: string) {
    return await this.client.exists(key);
  }

  ///// ========== Socket GameRoom =========== //////////

}
