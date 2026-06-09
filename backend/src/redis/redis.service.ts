import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

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
