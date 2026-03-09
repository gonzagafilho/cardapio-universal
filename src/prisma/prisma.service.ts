import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;
    const models = Reflect.ownKeys(this).filter(
      (k) => typeof k === 'string' && !k.startsWith('_') && k[0] === k[0].toLowerCase(),
    ) as string[];
    const exclude = ['$connect', '$disconnect', '$on', '$transaction', '$use'];
    for (const model of models) {
      if (exclude.includes(model)) continue;
      try {
        await (this as unknown as Record<string, { deleteMany: () => Promise<unknown> }>)[
          model
        ]?.deleteMany?.();
      } catch {
        // ignore
      }
    }
  }
}
