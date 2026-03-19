import { BadRequestException, Body, Controller, Post, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ROLES } from '../../common/constants/roles';
import { CsvImportService, CsvEntity } from './csv-import.service';

class CsvCommitDto {
  entity: CsvEntity;
  establishmentId: string;
  records: Array<{ rowNumber?: number; record: unknown }>;
}

@ApiTags('csv-import')
@ApiBearerAuth('access-token')
@Controller('csv-import')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CsvImportController {
  constructor(private readonly csvImportService: CsvImportService) {}

  @Post('preview')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.TENANT_ADMIN, ROLES.MANAGER)
  @ApiOperation({ summary: 'Preview (upload + parse + validação) do CSV de onboarding' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async preview(
    @TenantId() tenantId: string,
    @Query('entity') entity: CsvEntity,
    @Query('establishmentId') establishmentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Arquivo CSV obrigatório');
    if (!establishmentId) throw new BadRequestException('establishmentId é obrigatório');
    const allowed: CsvEntity[] = ['categories', 'products', 'tables'];
    if (!allowed.includes(entity)) {
      throw new BadRequestException('entity inválida');
    }
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('Somente arquivos .csv são aceitos');
    }

    return this.csvImportService.preview(tenantId, establishmentId, entity, file.buffer);
  }

  @Post('commit')
  @Roles(ROLES.SUPER_ADMIN, ROLES.TENANT_OWNER, ROLES.TENANT_ADMIN, ROLES.MANAGER)
  @ApiOperation({ summary: 'Commit (importação confirmada) do CSV' })
  async commit(
    @TenantId() tenantId: string,
    @Body() body: CsvCommitDto,
  ) {
    const { entity, establishmentId, records } = body ?? {};
    const allowed: CsvEntity[] = ['categories', 'products', 'tables'];
    if (!allowed.includes(entity)) throw new BadRequestException('entity inválida');
    if (!establishmentId) throw new BadRequestException('establishmentId é obrigatório');
    if (!Array.isArray(records) || records.length === 0) throw new BadRequestException('records inválido/ausente');

    return this.csvImportService.commit(tenantId, establishmentId, entity, records);
  }
}

