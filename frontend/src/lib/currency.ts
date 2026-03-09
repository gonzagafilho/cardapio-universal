export function formatCurrency(value: number, locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function parseCurrency(value: string): number {
  const cleaned = value.replace(/\D/g, '');
  return parseInt(cleaned, 10) / 100;
}
