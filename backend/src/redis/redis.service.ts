import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { GameState } from 'src/game/interfaces/game-state';
import { randomUUID } from 'crypto';

interface OnlineUsersData {
  id: number;
  name: string;
  avatar: string | null;
  score: number;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
    const url = process.env.REDIS_URL || 'redis://redis:6379';
    this.client = new Redis(url);

    this.client.on('connect', () => {
    });

    this.client.on('error', (err) => {
      console.error('Redis error', err);
    });
  }

  async onModuleInit() {
    await this.client.ping();
  }

  async onModuleDestroy() {
    await this.client.quit();
  }


  async addOnline(data: OnlineUsersData, sessionId: string) {
    const key = `user:online:${data.id}:${sessionId}`;
    await this.set(key, JSON.stringify(data));
  }

  async removeOnline(userId: number, sessionId: string) {
    await this.del(`user:online:${String(userId)}:${sessionId}`);
  }

  async isOnline(userId: number): Promise<boolean> {
    const users = await this.client.keys(`user:online:${userId}:*`);
    if (users.length === 0)
      return false;
    else
      return true;
  }

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

  async updateScore(userId: number, score: number) : Promise<void>{
	const keys = await this.client.keys(`user:online:${userId}:*`);
	for (const key of keys){
		const value = await this.client.get(key);
		if (!value)
			continue;
		const user = JSON.parse(value) as OnlineUsersData;
		user.score = score;
		await this.client.set(key, JSON.stringify(user));
	}
  }

  async updatePlayerPosition(
    gameId: string,
    userId: number,
    position: { x: number, y: number }) {
    await this.client.set(`game:${gameId}:player:${userId}:pos`, JSON.stringify(position))
  }

  async setGameWithTTL(gameId: string, state: any, ttlSeconds = 300) {
    await this.client.setex(
      `game:${gameId}:state`,
      ttlSeconds,
      JSON.stringify(state)
    );
  }

  async getGameState(gameId: string): Promise<GameState | null> {
    const data = await this.get(`game:${gameId}:state`);
    if (!data)
      return null;
    return (JSON.parse(data));
  }

  async deleteGameState(gameId: string){
	await this.del(`game:${gameId}:state`);
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

  async setEx(key: string, seconds: number, value: string) {
    await this.client.setex(key, seconds, value);
  }

  async exists(key: string) {
    return await this.client.exists(key);
  }

  async acquireLock(key: string, ttlSeconds: number): Promise<string | null> {
    const lockId = randomUUID();
    const result = await this.client.set(key, lockId, 'EX', ttlSeconds, 'NX');
    return result === 'OK' ? lockId : null;
  }

  async releaseLock(key: string, lockId: string): Promise<void> {
    const luaScript = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    await this.client.eval(luaScript, 1, key, lockId);
  }

  async acquireLockWithTime(key: string, ttlSeconds: number): Promise<string | null> {
    const timeout = 250;
    const endRetry = Date.now() + timeout;
    while (Date.now() < endRetry){
      const lockId = await this.acquireLock(key, ttlSeconds);
      if (lockId)
        return lockId;
      await new Promise((resolve) =>setTimeout(resolve, 5));
    }
    return null;
  }

  async waitForCache(key: string, timeoutMs: number): Promise<string | null> {
    const interval = 100;
    const steps = Math.ceil(timeoutMs / interval);
    for (let i = 0; i < steps; i++) {
      const cached = await this.client.get(key);
      if (cached) {
        return cached;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
    return null;
  }
}
