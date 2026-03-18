const TIMEZONE = 'America/Sao_Paulo';

/**
 * Retorna o início do dia (00:00:00.000) no fuso America/Sao_Paulo
 * para a data de referência, como instante UTC (Date).
 */
export function getStartOfDaySP(reference: Date = new Date()): Date {
  const str = reference.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
  const [y, m, d] = str.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 3, 0, 0, 0));
}

/**
 * Retorna o fim do dia (23:59:59.999) no fuso America/Sao_Paulo
 * para a data de referência, como instante UTC (Date).
 */
export function getEndOfDaySP(reference: Date = new Date()): Date {
  const str = reference.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
  const [y, m, d] = str.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1, 2, 59, 59, 999));
}

/**
 * Retorna { from, to } para um intervalo de datas em America/Sao_Paulo.
 * from e to são strings YYYY-MM-DD; fromDate e toDate são Date (início do from, fim do to).
 */
export function getRangeSP(from: string, to: string): {
  fromDate: Date;
  toDate: Date;
} {
  const [yF, mF, dF] = from.split('-').map(Number);
  const [yT, mT, dT] = to.split('-').map(Number);
  const fromDate = new Date(Date.UTC(yF, mF - 1, dF, 3, 0, 0, 0));
  const toDate = new Date(Date.UTC(yT, mT - 1, dT + 1, 2, 59, 59, 999));
  return { fromDate, toDate };
}
