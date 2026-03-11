import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_PIPE, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
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
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TrialGuard } from './common/guards/trial.guard';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import databaseConfig from './config/database/database.config';
import authConfig from './config/auth/auth.config';
import mercadopagoConfig from './config/mercadopago/mercadopago.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, authConfig, mercadopagoConfig],
    }),
    PrismaModule,
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
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: TrialGuard },
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
