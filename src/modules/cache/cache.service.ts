import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis | null = null;
  private ttlSeconds = 300;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('redis.url');
    if (url?.trim()) {
      try {
        this.client = new Redis(url, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => (times <= 3 ? Math.min(times * 200, 2000) : null),
          lazyConnect: true,
        });
        this.client.on('error', (err) => {
          this.logger.warn('Redis error', (err as Error)?.message);
        });
        this.ttlSeconds = this.config.get<number>('redis.ttlSeconds') ?? 300;
      } catch (err) {
        this.logger.warn('Redis init failed, cache disabled', (err as Error)?.message);
        this.client = null;
      }
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => {});
      this.client = null;
    }
  }

  isEnabled(): boolean {
    return this.client != null;
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (!this.client) return;
    const ttl = ttlSeconds ?? this.ttlSeconds;
    try {
      await this.client.setex(key, ttl, value);
    } catch (err) {
      this.logger.debug('Cache set failed', (err as Error)?.message);
    }
  }

  /** Remove uma chave (para invalidação). Sem efeito se Redis estiver desabilitado. */
  async del(key: string): Promise<void> {
    if (!this.client) return;
    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.debug('Cache del failed', (err as Error)?.message);
    }
  }
}
