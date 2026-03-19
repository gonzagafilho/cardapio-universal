import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';
import { Decimal } from '@prisma/client/runtime/library';
import { randomBytes } from 'crypto';
import { parseBoolean, parseCsvWithHeader, parseDecimalBR, detectDelimiter, slugifyName } from './csv-import.parser';

export type CsvEntity = 'categories' | 'products' | 'tables';

export type CsvRowPreview<T> = {
  rowNumber: number;
  errors: string[];
  record?: T;
};

export type CsvPreviewResponse = {
  entity: CsvEntity;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: Array<CsvRowPreview<unknown>>;
};

export type CsvCommitRowInput = {
  rowNumber?: number;
  record: unknown;
};

export type CsvCommitResponse = {
  entity: CsvEntity;
  created: number;
  updated: number;
  invalidRows: number;
};

type CategoryRecord = {
  name: string;
  description?: string | null;
  isActive: boolean;
};

type ProductRecord = {
  categoryName: string;
  categoryId?: string;
  name: string;
  description?: string | null;
  price: number;
  isActive: boolean;
  slug: string;
};

type TableRecord = {
  name: string;
  number?: string | null;
  isActive: boolean;
};

function parseOptionalString(value: string | undefined): string | null | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  return s;
}

@Injectable()
export class CsvImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  preview(
    tenantId: string,
    establishmentId: string,
    entity: CsvEntity,
    fileBuffer: Buffer,
  ): CsvPreviewResponse {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestException('CSV vazio');
    }

    const content = fileBuffer.toString('utf8');
    const delimiter = detectDelimiter(content);
    const parsed = parseCsvWithHeader(content, delimiter);

    if (!parsed.header?.length) {
      throw new BadRequestException('CSV sem cabeçalho');
    }

    const header = parsed.header;

    const requiredByEntity: Record<CsvEntity, string[]> = {
      categories: ['name'],
      products: ['categoryname', 'name', 'price'],
      tables: ['name'],
    };

    const required = requiredByEntity[entity] ?? [];
    const missing = required.filter((col) => !header.includes(col));
    if (missing.length > 0) {
      throw new BadRequestException(
        `CSV inválido para ${entity}. Colunas obrigatórias faltando: ${missing.join(', ')}`,
      );
    }

    const rows: Array<CsvRowPreview<unknown>> = [];

    for (let i = 0; i < parsed.rows.length; i++) {
      const rowNumber = parsed.rowNumberByIndex[i] ?? i + 2;
      const rowObj = parsed.rows[i] ?? {};

      const errors: string[] = [];

      try {
        if (entity === 'categories') {
          const name = String(rowObj['name'] ?? '').trim();
          if (!name || name.length < 2) errors.push('name: informe um nome com pelo menos 2 caracteres');

          const description = parseOptionalString(rowObj['description']);
          let isActive = true;
          try {
            if (rowObj['isactive'] != null && String(rowObj['isactive']).trim() !== '') {
              isActive = parseBoolean(rowObj['isactive'], true);
            }
          } catch (e) {
            errors.push(`isActive: ${(e as Error).message}`);
          }

          if (errors.length === 0) {
            const record: CategoryRecord = { name, description, isActive };
            rows.push({ rowNumber, errors: [], record });
          } else {
            rows.push({ rowNumber, errors });
          }
          continue;
        }

        if (entity === 'products') {
          const categoryName = String(rowObj['categoryname'] ?? '').trim();
          const name = String(rowObj['name'] ?? '').trim();
          const priceRaw = rowObj['price'];

          if (!categoryName) errors.push('categoryName: obrigatório');
          if (!name || name.length < 2) errors.push('name: informe um nome com pelo menos 2 caracteres');
          if (priceRaw == null || String(priceRaw).trim() === '') errors.push('price: obrigatório');

          let price = 0;
          if (errors.length === 0) {
            try {
              price = parseDecimalBR(String(priceRaw));
              if (price < 0) errors.push('price: deve ser >= 0');
            } catch (e) {
              errors.push(`price: ${(e as Error).message}`);
            }
          }

          const description = parseOptionalString(rowObj['description']);
          let isActive = true;
          try {
            if (rowObj['isactive'] != null && String(rowObj['isactive']).trim() !== '') {
              isActive = parseBoolean(rowObj['isactive'], true);
            }
          } catch (e) {
            errors.push(`isActive: ${(e as Error).message}`);
          }

          if (errors.length === 0) {
            const slug = slugifyName(name);
            if (!slug) errors.push('name: não foi possível gerar slug');

            if (errors.length === 0) {
              const record: ProductRecord = {
                categoryName,
                name,
                description,
                price,
                isActive,
                slug,
              };
              rows.push({ rowNumber, errors: [], record });
            } else {
              rows.push({ rowNumber, errors });
            }
          } else {
            rows.push({ rowNumber, errors });
          }
          continue;
        }

        if (entity === 'tables') {
          const name = String(rowObj['name'] ?? '').trim();
          const number = rowObj['number'] != null ? String(rowObj['number']).trim() : '';
          if (!name || name.length < 2) errors.push('name: informe um nome com pelo menos 2 caracteres');

          let isActive = true;
          try {
            if (rowObj['isactive'] != null && String(rowObj['isactive']).trim() !== '') {
              isActive = parseBoolean(rowObj['isactive'], true);
            }
          } catch (e) {
            errors.push(`isActive: ${(e as Error).message}`);
          }

          if (errors.length === 0) {
            const record: TableRecord = {
              name,
              number: number ? number : undefined,
              isActive,
            };
            rows.push({ rowNumber, errors: [], record });
          } else {
            rows.push({ rowNumber, errors });
          }
          continue;
        }
      } catch (e) {
        rows.push({ rowNumber, errors: [`Erro ao validar linha: ${(e as Error).message}`] });
        continue;
      }

      rows.push({ rowNumber, errors: errors.length ? errors : ['Linha inválida'] });
    }

    const validRows = rows.filter((r) => r.errors.length === 0).length;
    const invalidRows = rows.length - validRows;

    return {
      entity,
      totalRows: rows.length,
      validRows,
      invalidRows,
      rows,
    };
  }

  async commit(
    tenantId: string,
    establishmentId: string,
    entity: CsvEntity,
    rowsInput: CsvCommitRowInput[],
  ): Promise<CsvCommitResponse> {
    if (!rowsInput?.length) {
      throw new BadRequestException('Nenhuma linha enviada para commit');
    }

    // Re-validate + normalize on commit
    const normalizedRows: Array<{ rowNumber: number; errors: string[]; record?: any }> = [];
    for (let i = 0; i < rowsInput.length; i++) {
      const rowNumber = rowsInput[i]?.rowNumber ?? i + 2;
      const raw = rowsInput[i]?.record ?? {};
      const errors: string[] = [];

      if (entity === 'categories') {
        const name = String((raw as any).name ?? '').trim();
        if (!name || name.length < 2) errors.push('name: deve ter pelo menos 2 caracteres');
        const description = (raw as any).description != null ? String((raw as any).description).trim() : undefined;
        const isActive =
          (raw as any).isActive === undefined
            ? true
            : typeof (raw as any).isActive === 'boolean'
              ? (raw as any).isActive
              : parseBoolean(String((raw as any).isActive), true);

        if (errors.length === 0) {
          normalizedRows.push({ rowNumber, errors: [], record: { name, description, isActive } });
        } else {
          normalizedRows.push({ rowNumber, errors });
        }
        continue;
      }

      if (entity === 'products') {
        const categoryName = String((raw as any).categoryName ?? '').trim();
        const name = String((raw as any).name ?? '').trim();
        const priceValue = (raw as any).price;
        if (!categoryName) errors.push('categoryName: obrigatório');
        if (!name || name.length < 2) errors.push('name: deve ter pelo menos 2 caracteres');
        if (priceValue == null || String(priceValue).trim() === '') errors.push('price: obrigatório');

        let price = 0;
        if (errors.length === 0) {
          try {
            price = typeof priceValue === 'number' ? priceValue : parseDecimalBR(String(priceValue));
            if (price < 0) errors.push('price: deve ser >= 0');
          } catch (e) {
            errors.push(`price: ${(e as Error).message}`);
          }
        }

        const description =
          (raw as any).description != null ? String((raw as any).description).trim() : undefined;

        const isActive =
          (raw as any).isActive === undefined
            ? true
            : typeof (raw as any).isActive === 'boolean'
              ? (raw as any).isActive
              : parseBoolean(String((raw as any).isActive), true);

        const slug = slugifyName(name);
        if (!slug) errors.push('slug: inválido');

        if (errors.length === 0) {
          normalizedRows.push({
            rowNumber,
            errors: [],
            record: { categoryName, name, description, price, isActive, slug },
          });
        } else {
          normalizedRows.push({ rowNumber, errors });
        }
        continue;
      }

      if (entity === 'tables') {
        const name = String((raw as any).name ?? '').trim();
        const numberValue = (raw as any).number;
        const number = numberValue != null ? String(numberValue).trim() : '';
        if (!name || name.length < 2) errors.push('name: deve ter pelo menos 2 caracteres');

        const isActive =
          (raw as any).isActive === undefined
            ? true
            : typeof (raw as any).isActive === 'boolean'
              ? (raw as any).isActive
              : parseBoolean(String((raw as any).isActive), true);

        if (errors.length === 0) {
          normalizedRows.push({
            rowNumber,
            errors: [],
            record: { name, number: number ? number : undefined, isActive },
          });
        } else {
          normalizedRows.push({ rowNumber, errors });
        }
        continue;
      }
    }

    const invalidRows = normalizedRows.filter((r) => r.errors.length > 0);
    if (invalidRows.length > 0) {
      throw new BadRequestException({
        message: 'Falha na validação do commit',
        errors: invalidRows.map((r) => ({ rowNumber: r.rowNumber, errors: r.errors })),
      });
    }

    // Commit in transaction
    const createdUpdated = { created: 0, updated: 0 };

    await this.prisma.$transaction(async (tx) => {
      if (entity === 'categories') {
        for (const r of normalizedRows) {
          const record = r.record as CategoryRecord;
          const existing = await tx.category.findFirst({
            where: { tenantId, establishmentId, name: record.name },
            select: { id: true },
          });
          if (existing) {
            await tx.category.update({
              where: { id: existing.id },
              data: {
                description: record.description ?? null,
                isActive: record.isActive,
              },
            });
            createdUpdated.updated++;
          } else {
            await tx.category.create({
              data: {
                tenantId,
                establishmentId,
                name: record.name,
                description: record.description ?? null,
                isActive: record.isActive,
                sortOrder: 0,
              },
            });
            createdUpdated.created++;
          }
        }
        await this.cache.del(`store:${establishmentId}:categories`);
        await this.cache.del(`store:${establishmentId}:products`);
        return;
      }

      if (entity === 'products') {
        // Resolve category IDs in batch by categoryName
        const categoryNames = Array.from(
          new Set(normalizedRows.map((r) => (r.record as ProductRecord).categoryName)),
        );
        const categories = await tx.category.findMany({
          where: { tenantId, establishmentId, name: { in: categoryNames } },
          select: { id: true, name: true },
        });
        const categoryByName = new Map(categories.map((c) => [c.name, c.id]));

        for (const r of normalizedRows) {
          const record = r.record as ProductRecord;
          const categoryId = categoryByName.get(record.categoryName);
          if (!categoryId) {
            throw new BadRequestException({
              message: 'categoryName não encontrado para pelo menos uma linha',
              errors: [{ rowNumber: r.rowNumber, categoryName: record.categoryName }],
            });
          }

          const existing = await tx.product.findFirst({
            where: { tenantId, establishmentId, slug: record.slug },
            select: { id: true },
          });

          if (existing) {
            await tx.product.update({
              where: { id: existing.id },
              data: {
                categoryId,
                name: record.name,
                description: record.description ?? null,
                price: new Decimal(record.price),
                isActive: record.isActive,
                compareAtPrice: undefined,
                sku: null,
                isFeatured: false,
                isAvailable: true,
                sortOrder: 0,
              },
            });
            createdUpdated.updated++;
          } else {
            await tx.product.create({
              data: {
                tenantId,
                establishmentId,
                categoryId,
                name: record.name,
                slug: record.slug,
                description: record.description ?? null,
                price: new Decimal(record.price),
                isActive: record.isActive,
                isFeatured: false,
                isAvailable: true,
                sortOrder: 0,
              },
            });
            createdUpdated.created++;
          }
        }

        await this.cache.del(`store:${establishmentId}:products`);
        return;
      }

      if (entity === 'tables') {
        for (const r of normalizedRows) {
          const record = r.record as TableRecord;
          let existingId: string | null = null;
          if (record.number != null) {
            const existing = await tx.table.findFirst({
              where: { tenantId, establishmentId, number: record.number },
              select: { id: true },
            });
            existingId = existing?.id ?? null;
          }

          if (existingId) {
            await tx.table.update({
              where: { id: existingId },
              data: {
                name: record.name,
                isActive: record.isActive,
              },
            });
            createdUpdated.updated++;
          } else {
            // generate unique token (within establishment)
            for (let attempt = 1; attempt <= 5; attempt++) {
              const token = randomBytes(12).toString('base64url');
              try {
                await tx.table.create({
                  data: {
                    tenantId,
                    establishmentId,
                    name: record.name,
                    number: record.number ?? null,
                    token,
                    isActive: record.isActive,
                  },
                });
                createdUpdated.created++;
                break;
              } catch (e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002' && attempt < 5) {
                  continue;
                }
                throw e;
              }
            }
          }
        }
        return;
      }
    });

    return {
      entity,
      created: createdUpdated.created,
      updated: createdUpdated.updated,
      invalidRows: 0,
    };
  }
}

