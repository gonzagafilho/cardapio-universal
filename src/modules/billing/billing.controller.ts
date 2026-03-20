import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { BillingService } from './billing.service';
import { ChangePlanDto } from './dto/change-plan.dto';
import { CheckoutSubscriptionDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SkipTrialCheck } from '../../common/decorators/skip-trial-check.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';
import { CreatePixInvoiceDto } from './dto/create-pix-invoice.dto';
import { PixWebhookDto } from './dto/pix-webhook.dto';

@ApiTags('billing')
@Controller('billing')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('pricing')
  @Public()
  @ApiOperation({ summary: 'Tabela de precificação por restaurante (público)' })
  getPricing() {
    return this.billingService.getPricing();
  }

  @Get('subscription')
  @SkipTrialCheck()
  @ApiOperation({ summary: 'Ver assinatura atual do tenant' })
  getSubscription(@TenantId() tenantId: string) {
    return this.billingService.getSubscription(tenantId);
  }

  @Post('subscription/checkout')
  @SkipTrialCheck()
  @ApiOperation({ summary: 'Obter URL de checkout Mercado Pago para o plano' })
  async createCheckout(
    @TenantId() tenantId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CheckoutSubscriptionDto,
  ) {
    const result = await this.billingService.createCheckoutSubscription(
      tenantId,
      dto.plan,
      user.email,
    );
    if (!result) {
      return { checkoutUrl: null, message: 'Checkout com Mercado Pago não configurado' };
    }
    return result;
  }

  @Post('webhooks/mercadopago')
  @Public()
  @ApiOperation({ summary: 'Webhook Mercado Pago (assinaturas)' })
  async webhookMercadoPago(@Body() body: unknown, @Req() req: Request) {
    const xSignature = req.headers['x-signature'] as string | undefined;
    await this.billingService.processMercadoPagoWebhook(
      body as { type?: string; data?: { id?: string } },
      xSignature,
    );
    return { received: true };
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

  @Post('invoices/pix')
  @UseGuards(RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Criar cobrança PIX por tenant e vínculo de serviço (SUPER_ADMIN)' })
  createPixInvoice(@Body() dto: CreatePixInvoiceDto) {
    return this.billingService.createPixInvoice(dto);
  }

  @Post('webhooks/pix/:provider')
  @Public()
  @ApiOperation({ summary: 'Webhook PIX por provedor com idempotência' })
  processPixWebhook(
    @Param('provider') provider: string,
    @Body() payload: PixWebhookDto,
    @Req() req: Request,
  ) {
    return this.billingService.processPixWebhook(
      provider,
      payload,
      req.headers as Record<string, string | string[] | undefined>,
    );
  }

  @Get('invoices/:id')
  @UseGuards(RolesGuard)
  @Roles(ROLES.SUPER_ADMIN)
  @ApiOperation({ summary: 'Consultar cobrança PIX por id (SUPER_ADMIN)' })
  getInvoiceById(@Param('id') id: string) {
    return this.billingService.getBillingInvoiceById(id);
  }
}
