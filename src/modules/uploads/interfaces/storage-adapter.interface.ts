/**
 * Ponto de extensão para storage de arquivos (ex.: S3, GCS).
 * Implementação padrão: local (URL relativa). Em produção pode ser trocada por adapter externo.
 */
export const STORAGE_ADAPTER = 'STORAGE_ADAPTER';

export interface IStorageAdapter {
  saveImage(
    tenantId: string,
    establishmentId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string; filename: string }>;

  deleteImage(tenantId: string, id: string): Promise<{ message: string; id: string }>;
}
