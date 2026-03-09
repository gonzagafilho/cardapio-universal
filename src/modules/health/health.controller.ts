import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('db')
  @Public()
  async checkDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { database: 'ok' };
    } catch (e) {
      return { database: 'error', message: (e as Error).message };
    }
  }
}
