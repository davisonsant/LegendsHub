/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CurrencyType = 'USD' | 'EUR' | 'BRL';

export function getCurrencySymbol(): string {
  const current = (localStorage.getItem('legendshub_currency') as CurrencyType) || 'USD';
  if (current === 'EUR') return '€';
  if (current === 'BRL') return 'R$';
  return '$';
}

export function formatMoney(valueInUSD: number): string {
  const current = (localStorage.getItem('legendshub_currency') as CurrencyType) || 'USD';
  const symbol = current === 'EUR' ? '€' : current === 'BRL' ? 'R$' : '$';
  const rate = current === 'EUR' ? 0.9 : current === 'BRL' ? 5.0 : 1.0;
  
  const converted = Math.round(valueInUSD * rate);
  
  if (converted >= 1000000) {
    return `${symbol} ${(converted / 1000000).toFixed(2).replace(/\.00$/, '')}M`;
  } else if (converted >= 1000) {
    return `${symbol} ${(converted / 1000).toLocaleString('pt-BR')}k`;
  }
  return `${symbol} ${converted.toLocaleString('pt-BR')}`;
}
