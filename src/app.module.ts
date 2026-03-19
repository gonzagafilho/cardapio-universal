import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_PIPE, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { EstablishmentsModule } from './modules/establishments/establishments.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { ProductOptionsModule } from './modules/product-options/product-options.module';
import { CartsModule } from './modules/carts/carts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CustomersModule } from './modules/customers/customers.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { DeliveryZonesModule } from './modules/delivery-zones/delivery-zones.module';
import { SettingsModule } from './modules/settings/settings.module';
import { ReportsModule } from './modules/reports/reports.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { StorePublicModule } from './modules/store-public/store-public.module';
import { PlansModule } from './modules/plans/plans.module';
import { BillingModule } from './modules/billing/billing.module';
import { CsvImportModule } from './modules/csv-import/csv-import.module';
import { MasterServicesModule } from './modules/master-services/master-services.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TrialGuard } from './common/guards/trial.guard';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { requestIdMiddleware } from './common/middleware/request-id.middleware';
import databaseConfig from './config/database/database.config';
import authConfig from './config/auth/auth.config';
import mercadopagoConfig from './config/mercadopago/mercadopago.config';
import redisConfig from './config/redis/redis.config';
import { CacheModule } from './modules/cache/cache.module';
import { ThrottlerModule } from '@nestjs/throttler';

const redisUrl = process.env.REDIS_URL?.trim() ?? '';
const useBullQueue = redisUrl.startsWith('redis://');

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, mercadopagoConfig, redisConfig],
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 60_000, limit: 60 },
      { name: 'publicRead', ttl: 60_000, limit: 120 },
      { name: 'publicWrite', ttl: 60_000, limit: 20 },
      { name: 'auth', ttl: 60_000, limit: 10 },
    ]),
    PrismaModule,
    CacheModule,
    ...(useBullQueue
      ? [
          BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => {
              const url = config.get<string>('redis.url')?.trim() || '';
              if (url.startsWith('redis://')) {
                try {
                  const u = new URL(url);
                  return {
                    connection: {
                      host: u.hostname || 'localhost',
                      port: u.port ? parseInt(u.port, 10) : 6379,
                      password: u.password || undefined,
                    },
                  };
                } catch {
                  return { connection: { host: 'localhost', port: 6379 } };
                }
              }
              return { connection: { host: 'localhost', port: 6379 } };
            },
            inject: [ConfigService],
          }),
        ]
      : []),
    AuthModule,
    UsersModule,
    TenantsModule,
    EstablishmentsModule,
    CategoriesModule,
    ProductsModule,
    ProductOptionsModule,
    CartsModule,
    OrdersModule,
    PaymentsModule,
    CustomersModule,
    CouponsModule,
    DeliveryZonesModule,
    SettingsModule,
    ReportsModule,
    UploadsModule,
    AuditModule,
    HealthModule,
    StorePublicModule,
    PlansModule,
    BillingModule,
    CsvImportModule,
    MasterServicesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: TrialGuard },
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(requestIdMiddleware).forRoutes('*');
  }
}
