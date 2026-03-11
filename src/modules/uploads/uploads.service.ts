import { Inject, Injectable } from '@nestjs/common';
import { IStorageAdapter } from './interfaces/storage-adapter.interface';
import { STORAGE_ADAPTER } from './interfaces/storage-adapter.interface';

@Injectable()
export class UploadsService {
  constructor(
    @Inject(STORAGE_ADAPTER) private readonly storage: IStorageAdapter,
  ) {}

  async saveImage(
    tenantId: string,
    establishmentId: string,
    file: Express.Multer.File,
  ) {
    return this.storage.saveImage(tenantId, establishmentId, file);
  }

  async deleteImage(tenantId: string, id: string) {
    return this.storage.deleteImage(tenantId, id);
  }
}
