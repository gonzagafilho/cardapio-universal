import { Module } from '@nestjs/common';
import { TableSessionService } from './table-session.service';
import { TableSessionController } from './table-session.controller';

@Module({
  controllers: [TableSessionController],
  providers: [TableSessionService],
  exports: [TableSessionService],
})
export class TableSessionModule {}
