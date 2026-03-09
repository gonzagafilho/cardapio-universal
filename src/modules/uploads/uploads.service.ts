import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(private readonly prisma: PrismaService) {}

  async saveImage(
    tenantId: string,
    establishmentId: string,
    file: Express.Multer.File,
  ) {
    // Placeholder: em produção salvar em storage (S3, GCS) e retornar URL
    const url = `/uploads/${tenantId}/${establishmentId}/${file.filename ?? file.originalname}`;
    return { url, filename: file.filename ?? file.originalname };
  }

  async deleteImage(tenantId: string, id: string) {
    // Placeholder: remover arquivo do storage
    return { message: 'Imagem removida', id };
  }
}
