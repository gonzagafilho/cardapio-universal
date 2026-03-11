import { registerAs } from '@nestjs/config';

/**
 * Configuração Mercado Pago para assinaturas recorrentes.
 * Variáveis de ambiente documentadas em .env.example.
 */
export default registerAs('mercadopago', () => ({
  /** Access Token (produção ou teste). Vazio = integração desabilitada. */
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? '',
  /** Assinatura secreta do webhook (opcional). Se definida, valida x-signature. */
  webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET ?? '',
  /** URL de retorno após pagamento no Mercado Pago (ex.: https://admin.xxx/billing). */
  backUrl: process.env.BILLING_BACK_URL ?? process.env.CORS_ORIGINS?.split(',')[0] ?? 'http://localhost:3001/billing',
  /** Valores em BRL por plano (exemplo; ajustar conforme tabela comercial). */
  planAmounts: {
    basic: parseFloat(process.env.MERCADOPAGO_PLAN_AMOUNT_BASIC ?? '29.90'),
    pro: parseFloat(process.env.MERCADOPAGO_PLAN_AMOUNT_PRO ?? '79.90'),
    enterprise: parseFloat(process.env.MERCADOPAGO_PLAN_AMOUNT_ENTERPRISE ?? '199.90'),
  },
  /** URL para notificações de pagamento (PIX, etc.). Ex.: https://api.xxx.com/api/payments/webhooks/mercadopago */
  paymentNotificationUrl: process.env.MERCADOPAGO_PAYMENT_NOTIFICATION_URL ?? '',
}));
