import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  readonly client: Redis;
  readonly subscriber: Redis;
  readonly publisher: Redis;

  private readonly handlers = new Map<string, (message: unknown) => void>();

  constructor() {
    const url = process.env.REDIS_URL || 'redis://redis:6379';
    this.client = new Redis(url);
    this.subscriber = new Redis(url);
    this.publisher = new Redis(url);

    this.subscriber.on('message', (chan: string, msg: string) => {
      this.handlers.get(chan)?.(JSON.parse(msg));
    });
  }

  async onModuleDestroy() {
    await Promise.all([
      this.client.quit(),
      this.subscriber.quit(),
      this.publisher.quit(),
    ]);
  }

  // ── Game state ──────────────────────────────────────────────────────────────

  async setGameState(roomId: string, state: unknown): Promise<void> {
    await this.client.set(`game:${roomId}`, JSON.stringify(state), 'EX', 3600);
  }

  async getGameState<T>(roomId: string): Promise<T | null> {
    const data = await this.client.get(`game:${roomId}`);
    return data ? (JSON.parse(data) as T) : null;
  }

  async deleteGameState(roomId: string): Promise<void> {
    await this.client.del(`game:${roomId}`);
  }

  // ── Pub/Sub — enables game events to sync across multiple backend instances ─

  async publish(channel: string, message: unknown): Promise<void> {
    await this.publisher.publish(channel, JSON.stringify(message));
  }

  async subscribe(channel: string, handler: (message: unknown) => void): Promise<void> {
    this.handlers.set(channel, handler);
    await this.subscriber.subscribe(channel);
  }

  async unsubscribe(channel: string): Promise<void> {
    this.handlers.delete(channel);
    await this.subscriber.unsubscribe(channel);
  }
}
