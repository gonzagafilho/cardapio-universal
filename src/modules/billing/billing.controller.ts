import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BillingService } from './billing.service';
import { ChangePlanDto } from './dto/change-plan.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('billing')
@Controller('billing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('subscription')
  @ApiOperation({ summary: 'Ver assinatura atual do tenant' })
  getSubscription(@TenantId() tenantId: string) {
    return this.billingService.getSubscription(tenantId);
  }

  @Patch('subscription/plan')
  @ApiOperation({ summary: 'Mudar plano da assinatura' })
  changePlan(@TenantId() tenantId: string, @Body() dto: ChangePlanDto) {
    return this.billingService.changePlan(tenantId, dto.plan);
  }

  @Post('subscription/cancel')
  @ApiOperation({ summary: 'Cancelar assinatura (fim do período ou imediato)' })
  cancel(
    @TenantId() tenantId: string,
    @Body('immediately') immediately?: boolean,
  ) {
    return this.billingService.cancel(tenantId, immediately === true);
  }

  @Post('subscription/reactivate')
  @ApiOperation({ summary: 'Reativar assinatura cancelada' })
  reactivate(@TenantId() tenantId: string) {
    return this.billingService.reactivate(tenantId);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Histórico de faturas do tenant' })
  getInvoices(
    @TenantId() tenantId: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? Math.min(Number(limit), 100) : 50;
    return this.billingService.getInvoices(tenantId, limitNum);
  }
}
