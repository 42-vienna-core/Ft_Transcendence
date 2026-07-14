import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { GameState } from 'src/game/interfaces/game-state';

interface onlineUsers {
  id: number;
  name: string;
  avatar: string;

}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
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

  async addOnlineUser(data: onlineUsers) : Promise<boolean> {
    const key = `user:online:${data.id}`;
    const oldSocketId = await this.client.get(key);

    await this.client.set(key, JSON.stringify(data));

    return !oldSocketId;
  }

  async removeOnlineUser(userId: number) {
    await this.client.del(`user:online:${userId}`);
  }

 async getOnlineUsers(): Promise<onlineUsers[]> {
  const keys = await this.client.keys('user:online:*');
  if (keys.length === 0) return [];
  
  const values = await this.client.mget(keys);
  return values
    .filter((val): val is string => val !== null)
    .map((val) => JSON.parse(val) as onlineUsers);
}

  async setGameState(gameId: string, state: any ) {
    await this.client.set(`game:${gameId}:state`, JSON.stringify(state) );
  }

  async getGameState(gameId: string) : Promise<GameState | null> {
	const data = await this.client.get(`game:${gameId}:state`);
	if (!data)
		return null;
	return (JSON.parse(data));
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

  ///// ========== Socket GameRoom =========== //////////

  // Sessions

  async addSessionToBlackList(sessionId: string): Promise<void> {
    await this.client.set(`session:blacklist:${sessionId}`, 'true', 'EX', 15 * 60); //todo ttl
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

  // TODO: User rate limits

}
