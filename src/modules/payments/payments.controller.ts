import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Criar intenção de pagamento' })
  createIntent(
    @TenantId() tenantId: string,
    @Body('establishmentId') establishmentId: string,
    @Body('orderId') orderId: string,
    @Body('amount') amount: number,
    @Body('method') method: string,
  ) {
    return this.paymentsService.createIntent(
      tenantId,
      establishmentId,
      orderId,
      amount,
      method,
    );
  }

  @Post('pix')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Gerar pagamento PIX (Mercado Pago)' })
  createPix(
    @TenantId() tenantId: string,
    @Body('establishmentId') establishmentId: string,
    @Body('orderId') orderId: string,
    @Body('amount') amount: number,
    @Body('payerEmail') payerEmail?: string,
  ) {
    return this.paymentsService.createPix(
      tenantId,
      establishmentId,
      orderId,
      amount,
      payerEmail ?? '',
    );
  }

  @Post('webhooks/mercadopago')
  @Public()
  @ApiOperation({ summary: 'Webhook Mercado Pago (notificações de pagamento PIX)' })
  webhookMercadoPago(@Body() body: unknown) {
    return this.paymentsService.webhook('mercadopago', body);
  }

  @Post('card')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Pagamento com cartão' })
  createCard(
    @TenantId() tenantId: string,
    @Body('establishmentId') establishmentId: string,
    @Body('orderId') orderId: string,
    @Body('amount') amount: number,
  ) {
    return this.paymentsService.createCard(
      tenantId,
      establishmentId,
      orderId,
      amount,
    );
  }

  @Post('webhook')
  @Public()
  @ApiOperation({ summary: 'Webhook genérico (provider no query)' })
  webhook(
    @Query('provider') provider: string,
    @Body() payload: unknown,
  ) {
    return this.paymentsService.webhook(provider ?? '', payload);
  }

  @Get(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Status do pagamento' })
  getStatus(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.paymentsService.getStatus(tenantId, id);
  }
}
