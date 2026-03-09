import {
  Controller,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';

@ApiTags('uploads')
@ApiBearerAuth('access-token')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiOperation({ summary: 'Upload de imagem' })
  uploadImage(
    @TenantId() tenantId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('establishmentId') establishmentId?: string,
  ) {
    return this.uploadsService.saveImage(
      tenantId,
      establishmentId ?? '',
      file,
    );
  }

  @Delete('image/:id')
  @ApiOperation({ summary: 'Remover imagem' })
  deleteImage(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.uploadsService.deleteImage(tenantId, id);
  }
}
