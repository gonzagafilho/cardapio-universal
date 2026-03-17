import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  url: process.env.REDIS_URL ?? '',
  ttlSeconds: parseInt(process.env.REDIS_CACHE_TTL ?? '300', 10),
}));
