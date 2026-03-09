import { DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';

export function getSwaggerConfig(): Omit<OpenAPIObject, 'paths'> {
  return new DocumentBuilder()
    .setTitle('Cardápio Universal API')
    .setDescription('API SaaS de cardápio digital multi-tenant')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token',
    )
    .addTag('auth', 'Autenticação')
    .addTag('tenants', 'Tenants')
    .addTag('establishments', 'Estabelecimentos')
    .addTag('categories', 'Categorias')
    .addTag('products', 'Produtos')
    .addTag('orders', 'Pedidos')
    .addTag('payments', 'Pagamentos')
    .build();
}
