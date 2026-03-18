import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { TableSessionService } from './table-session.service';
import { UpdateSessionAccountDto } from './dto/update-session-account.dto';
import { CreateSessionPixDto } from './dto/create-session-pix.dto';

@ApiTags('table-sessions')
@ApiBearerAuth('access-token')
@Controller('table-sessions')
@UseGuards(JwtAuthGuard)
export class TableSessionController {
  constructor(private readonly tableSessionService: TableSessionService) {}

  @Get('cashier-summary/:establishmentId')
  @ApiOperation({ summary: 'Fechamento de caixa do dia' })
  async getCashierSummary(
    @TenantId() tenantId: string,
    @Param('establishmentId') establishmentId: string,
  ) {
    return this.tableSessionService.getCashierSummary(tenantId, establishmentId);
  }

  @Get('report-range/:establishmentId')
  @ApiOperation({ summary: 'Relatório por período (from/to YYYY-MM-DD)' })
  async getReportRange(
    @TenantId() tenantId: string,
    @Param('establishmentId') establishmentId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    if (!from || !to) {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
      return this.tableSessionService.getReportRange(tenantId, establishmentId, today, today);
    }
    return this.tableSessionService.getReportRange(tenantId, establishmentId, from, to);
  }

  @Get('report-today/:establishmentId')
  @ApiOperation({ summary: 'Relatório do dia (métricas + ranking de mesas)' })
  async getReportToday(
    @TenantId() tenantId: string,
    @Param('establishmentId') establishmentId: string,
  ) {
    return this.tableSessionService.getReportToday(tenantId, establishmentId);
  }

  @Get('stats-today/:establishmentId')
  @ApiOperation({ summary: 'Estatísticas do salão para o dia (dashboard global)' })
  async getStatsToday(
    @TenantId() tenantId: string,
    @Param('establishmentId') establishmentId: string,
  ) {
    return this.tableSessionService.getStatsToday(tenantId, establishmentId);
  }

  @Get('by-establishment/:establishmentId')
  @ApiOperation({ summary: 'Sessões OPEN de todas as mesas do estabelecimento (batch)' })
  async getByEstablishment(
    @TenantId() tenantId: string,
    @Param('establishmentId') establishmentId: string,
  ) {
    return this.tableSessionService.getOpenSessionsByEstablishment(
      tenantId,
      establishmentId,
    );
  }

  @Get('history-by-table/:tableId')
  @ApiOperation({ summary: 'Histórico de sessões da mesa (ordenado por abertura)' })
  async getHistoryByTable(
    @TenantId() tenantId: string,
    @Param('tableId') tableId: string,
  ) {
    return this.tableSessionService.getSessionsByTable(tenantId, tableId, 10);
  }

  @Get('by-table/:tableId')
  @ApiOperation({ summary: 'Sessão OPEN da mesa (fonte de verdade para ativa/encerrada)' })
  async getByTable(
    @TenantId() tenantId: string,
    @Param('tableId') tableId: string,
  ) {
    const session = await this.tableSessionService.getOpenSessionByTable(
      tenantId,
      tableId,
    );
    return { open: !!session, session: session ?? null };
  }

  @Patch('account/:sessionId')
  @ApiOperation({ summary: 'Atualizar conta da sessão (taxa/desconto)' })
  async updateAccount(
    @TenantId() tenantId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: UpdateSessionAccountDto,
  ) {
    return this.tableSessionService.updateSessionAccount(tenantId, sessionId, {
      serviceFeeAmount: dto.serviceFeeAmount,
      discountAmount: dto.discountAmount,
    });
  }

  @Post('account/:sessionId/pay')
  @ApiOperation({ summary: 'Marcar sessão como paga' })
  async markAsPaid(
    @TenantId() tenantId: string,
    @Param('sessionId') sessionId: string,
  ) {
    return this.tableSessionService.markSessionAsPaid(tenantId, sessionId);
  }

  @Post('account/:sessionId/pix')
  @ApiOperation({ summary: 'Gerar pagamento PIX (Mercado Pago) para a sessão' })
  async createPix(
    @TenantId() tenantId: string,
    @Param('sessionId') sessionId: string,
    @Body() dto: CreateSessionPixDto,
  ) {
    return this.tableSessionService.createSessionPix(tenantId, sessionId, {
      payerEmail: dto.payerEmail,
    });
  }

  @Post(':tableId/close')
  @ApiOperation({ summary: 'Encerrar sessão aberta da mesa' })
  async closeByTable(
    @TenantId() tenantId: string,
    @Param('tableId') tableId: string,
  ) {
    const result = await this.tableSessionService.closeOpenSessionByTable(
      tenantId,
      tableId,
    );
    if (result.closed) {
      return { closed: true, session: result.session };
    }
    return { closed: false, message: 'Nenhuma sessão aberta para esta mesa' };
  }
}
