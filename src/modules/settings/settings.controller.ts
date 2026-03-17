import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateStoreSettingsDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ROLES } from '../../common/constants/roles';

@ApiTags('settings')
@ApiBearerAuth('access-token')
@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('store')
  @ApiOperation({ summary: 'Configurações da loja' })
  getStore(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId: string,
  ) {
    return this.settingsService.getStore(tenantId, establishmentId);
  }

  @Patch('store')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Atualizar configurações da loja' })
  updateStore(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId: string,
    @Body() dto: UpdateStoreSettingsDto,
  ) {
    return this.settingsService.updateStore(tenantId, establishmentId, dto);
  }

  @Patch('hours')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Atualizar horário de funcionamento' })
  updateHours(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId: string,
    @Body('openHours') openHours: Record<string, { open: string; close: string }>,
  ) {
    return this.settingsService.updateHours(tenantId, establishmentId, openHours);
  }

  @Patch('branding')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Atualizar cores/marca' })
  updateBranding(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId: string,
    @Body() data: { primaryColor?: string; secondaryColor?: string; accentColor?: string },
  ) {
    return this.settingsService.updateBranding(tenantId, establishmentId, data);
  }

    @Patch('payment-methods')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
  @ApiOperation({ summary: 'Atualizar formas de pagamento' })
  updatePaymentMethods(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId: string,
    @Body()
    data: {
      paymentPix?: boolean;
      paymentCardOnDelivery?: boolean;
      paymentCardOnCounter?: boolean;
    },
  ) {
    return this.settingsService.updatePaymentMethods(tenantId, establishmentId, data);
  }
    @Patch('delivery')
    @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.MANAGER)
    @ApiOperation({ summary: 'Atualizar configurações de entrega' })
    updateDelivery(
    @TenantId() tenantId: string,
    @Query('establishmentId') establishmentId: string,
    @Body()
    data: {
      acceptsDelivery?: boolean;
      acceptsPickup?: boolean;
      acceptsDineIn?: boolean;
      deliveryFee?: number;
      minimumOrderAmount?: number;
      minimumOrderAmountDelivery?: number;
      estimatedDeliveryTimeMin?: number;
      estimatedDeliveryTimeMax?: number;
    },
  ) {
    return this.settingsService.updateDelivery(tenantId, establishmentId, data);
  }
    
}
