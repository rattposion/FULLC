/**
 * Converte um valor para número e retorna 0 se o resultado for NaN
 * @param value - Valor a ser convertido
 * @returns Número convertido ou 0 se inválido
 */
export function ensureNumber(value: number | undefined | null): number {
  if (value === undefined || value === null || isNaN(value)) {
    return 0;
  }
  return value;
} 