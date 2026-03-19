export type CsvParseResult = {
  header: string[];
  rows: Record<string, string>[]; // object keyed by header
  rowNumberByIndex: number[]; // 1-based csv line number
};

function normalizeHeaderName(name: string): string {
  return name.trim().toLowerCase();
}

export function parseCsvWithHeader(
  content: string,
  delimiter: ',' | ';' = ',',
): CsvParseResult {
  // Remove BOM if present
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i] ?? '';
    const next = content[i + 1] ?? '';

    if (inQuotes) {
      if (char === '"') {
        if (next === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === delimiter) {
      row.push(field);
      field = '';
      continue;
    }

    if (char === '\r') continue;

    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += char;
  }

  // last line
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // drop empty tail rows
  const nonEmptyRows = rows.filter((r) => r.some((c) => c.trim() !== ''));
  if (nonEmptyRows.length === 0) {
    return { header: [], rows: [], rowNumberByIndex: [] };
  }

  const headerRaw = nonEmptyRows[0] ?? [];
  const header = headerRaw.map(normalizeHeaderName);

  // build index for mapping header->value
  const rowNumberByIndex: number[] = [];
  const objects: Record<string, string>[] = [];
  const startLine = 2; // header is line 1

  for (let idx = 1; idx < nonEmptyRows.length; idx++) {
    const rawRow = nonEmptyRows[idx] ?? [];
    const obj: Record<string, string> = {};

    for (let col = 0; col < header.length; col++) {
      const key = header[col];
      if (!key) continue;
      obj[key] = (rawRow[col] ?? '').trim();
    }

    objects.push(obj);
    rowNumberByIndex.push(startLine + (idx - 1));
  }

  return { header, rows: objects, rowNumberByIndex };
}

export function detectDelimiter(content: string): ',' | ';' {
  const sample = content.slice(0, 5000);
  const commaCount = (sample.match(/,/g) ?? []).length;
  const semiCount = (sample.match(/;/g) ?? []).length;
  return semiCount > commaCount ? ';' : ',';
}

export function parseBoolean(value: string | undefined, defaultValue = true): boolean {
  if (value == null) return defaultValue;
  const v = String(value).trim().toLowerCase();
  if (!v) return defaultValue;
  if (['true', '1', 'yes', 'y', 'sim', 's'].includes(v)) return true;
  if (['false', '0', 'no', 'n', 'nao', 'não'].includes(v)) return false;
  throw new Error(`Valor booleano inválido: "${value}"`);
}

export function parseDecimalBR(value: string | undefined): number {
  if (value == null) throw new Error('Valor numérico ausente');
  const raw = String(value).trim();
  if (!raw) throw new Error('Valor numérico vazio');

  let normalized = raw;

  if (normalized.includes(',') && normalized.includes('.')) {
    const lastComma = normalized.lastIndexOf(',');
    const lastDot = normalized.lastIndexOf('.');
    if (lastComma > lastDot) {
      // 1.234,56 -> 1234.56
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    } else {
      // 1,234.56 -> 123456? (treat commas as thousand separators)
      normalized = normalized.replace(/,/g, '');
    }
  } else if (normalized.includes(',')) {
    // 123,45 -> 123.45
    normalized = normalized.replace(',', '.');
  }

  const cleaned = normalized.replace(/[^\d.-]/g, '');
  const n = Number(cleaned);
  if (!Number.isFinite(n)) throw new Error(`Número inválido: "${value}"`);
  return n;
}

export function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

