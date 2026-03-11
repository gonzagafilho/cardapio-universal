import { Injectable } from '@nestjs/common';
import { IStorageAdapter } from '../interfaces/storage-adapter.interface';

/**
 * Adapter de storage local: retorna URL relativa (comportamento atual).
 * Em produção pode ser substituído por S3/GCS sem alterar controller nem assinaturas.
 */
@Injectable()
export class LocalStorageAdapter implements IStorageAdapter {
  async saveImage(
    tenantId: string,
    establishmentId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string; filename: string }> {
    const filename = file.filename ?? file.originalname;
    const url = `/uploads/${tenantId}/${establishmentId}/${filename}`;
    return { url, filename };
  }

  async deleteImage(_tenantId: string, id: string): Promise<{ message: string; id: string }> {
    return { message: 'Imagem removida', id };
  }
}
