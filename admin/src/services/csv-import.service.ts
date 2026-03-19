import { apiPost, apiPostFormData } from './api';

export type CsvEntity = 'categories' | 'products' | 'tables';

export type CsvRowPreview<T = unknown> = {
  rowNumber: number;
  errors: string[];
  record?: T;
};

export interface CsvPreviewResponse<T = unknown> {
  entity: CsvEntity;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: Array<CsvRowPreview<T>>;
}

export interface CsvCommitResponse {
  entity: CsvEntity;
  created: number;
  updated: number;
  invalidRows: number;
}

export async function previewCsvImport(
  entity: CsvEntity,
  establishmentId: string,
  file: File,
): Promise<CsvPreviewResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return apiPostFormData<CsvPreviewResponse>(
    `/csv-import/preview?entity=${encodeURIComponent(entity)}&establishmentId=${encodeURIComponent(establishmentId)}`,
    formData,
  );
}

export async function commitCsvImport(
  entity: CsvEntity,
  establishmentId: string,
  validRows: Array<{ rowNumber: number; record: unknown }>,
): Promise<CsvCommitResponse> {
  return apiPost<CsvCommitResponse>(`/csv-import/commit`, {
    entity,
    establishmentId,
    records: validRows,
  });
}

