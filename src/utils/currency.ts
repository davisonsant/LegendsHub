/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CurrencyType = 'USD' | 'EUR' | 'BRL';

export function getCurrencyType(): CurrencyType {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return (localStorage.getItem('legendshub_currency') as CurrencyType) || 'USD';
  }
  return 'USD';
}

export function getCurrencySymbol(): string {
  const type = getCurrencyType();
  if (type === 'EUR') return '€';
  if (type === 'BRL') return 'R$';
  return '$';
}

export function formatMoney(valueInUSD: number): string {
  const symbol = getCurrencySymbol();
  const converted = Math.round(valueInUSD);
  if (converted >= 1000000) {
    const formatted = (converted / 1000000).toFixed(2);
    return `${symbol} ${formatted}M`;
  }
  return `${symbol} ${converted.toLocaleString('pt-BR')}`;
}

export function getCaixaFormatadoHud(value: number): string {
  const symbol = getCurrencySymbol();
  if (value < 1000000) {
    return `${symbol} ${value.toLocaleString('pt-BR')}`;
  }
  const formatted = (value / 1000000).toFixed(2);
  return `${symbol} ${formatted}M`;
}

