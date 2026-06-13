/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CurrencyType = 'USD' | 'EUR' | 'BRL';

export function getCurrencyType(): CurrencyType {
  if (typeof window !== 'undefined') {
    const gs = (window as any).__legendshub_gameState;
    if (gs && gs.finance && gs.finance.currency) {
      const gCurr = gs.finance.currency;
      if (gCurr === 'EUR' || gCurr === '€') return 'EUR';
      if (gCurr === 'BRL' || gCurr === 'R$') return 'BRL';
      if (gCurr === 'USD' || gCurr === '$') return 'USD';
    }
  }
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    return (localStorage.getItem('legendshub_currency') as CurrencyType) || 'USD';
  }
  return 'USD';
}

export function getCurrencySymbol(): string {
  if (typeof window !== 'undefined') {
    const gs = (window as any).__legendshub_gameState;
    if (gs && gs.finance && gs.finance.currency) {
      const gCurr = gs.finance.currency;
      if (gCurr === 'EUR') return '€';
      if (gCurr === 'BRL') return 'R$';
      if (gCurr === 'USD') return '$';
      if (gCurr === '€' || gCurr === '$' || gCurr === 'R$') return gCurr;
    }
  }
  const type = getCurrencyType();
  if (type === 'EUR') return '€';
  if (type === 'BRL') return 'R$';
  return '$';
}

export const NumberFormatter = {
  format: (value: number, options?: { abbreviate?: boolean; decimals?: number }): string => {
    const symbol = getCurrencySymbol();
    const converted = Math.round(value);
    const decimals = options?.decimals !== undefined ? options.decimals : 1;
    
    if (options?.abbreviate) {
      if (converted >= 1000000) {
        const val = converted / 1000000;
        // Correctly formats like € 1.19M or € 1.5M
        const formatted = val.toFixed(decimals);
        const cleaned = formatted.replace(/\.0$/, '').replace(/(\.\d)0$/, '$1');
        return `${symbol} ${cleaned}M`;
      }
      if (converted >= 1000) {
        const val = converted / 1000;
        // Correctly formats like € 24.5K (equivalente a 24.500)
        const formatted = val.toFixed(decimals);
        const cleaned = formatted.replace(/\.0$/, '').replace(/(\.\d)0$/, '$1');
        return `${symbol} ${cleaned}K`;
      }
      return `${symbol} ${converted}`;
    }
    
    // Extenso standard pt-BR formatting, e.g. € 24.500 or € 1.190.000
    return `${symbol} ${converted.toLocaleString('pt-BR')}`;
  }
};

export function formatMoney(valueInUSD: number): string {
  const converted = Math.round(valueInUSD);
  if (converted >= 1000000) {
    return NumberFormatter.format(converted, { abbreviate: true, decimals: 2 });
  }
  return NumberFormatter.format(converted);
}

export function getCaixaFormatadoHud(value: number): string {
  return formatMoney(value);
}

/**
 * 📉 RECALIBRAÇÃO DA FÓRMULA DE VALOR DE MERCADO
 * Tier S+ (OVR 90+): € 1.50M - € 2.50M
 * Tier A (OVR 80-89): € 600K - € 1.20M
 * Tier B/Academy (OVR <80): € 80K - € 450K
 */
export function calcularValorMercado(overall: number, potential: number): number {
  let base = 0;
  if (overall >= 90) {
    base = 1500000 + (overall - 90) * 110000 + (potential - overall) * 18000;
    base = Math.max(1500000, Math.min(2500000, base));
  } else if (overall >= 80) {
    base = 600000 + (overall - 80) * 50000 + (potential - overall) * 12000;
    base = Math.max(600000, Math.min(1200000, base));
  } else {
    base = 80000 + (overall - 60) * 16000 + (potential - overall) * 4500;
    base = Math.max(80000, Math.min(450000, base));
  }
  return Math.round(base);
}

/**
 * 💸 AJUSTE LOGÍSTICO DOS SALÁRIOS SEMANAIS
 * Atrelado ao Valor de Mercado.
 * Estrelas S+ (OVR 90+, marketValue >= €1.5M) devem receber semanalmente entre € 18.000 e € 28.000.
 * Jogadores Tier A (marketValue €600K - €1.5M) devem receber semanalmente entre € 10.000 e € 17.000.
 * Jogadores Tier B/Academy (marketValue < €600K) devem receber semanalmente entre € 1.200 e € 8.500.
 */
export function calcularSalarioSemanal(valorMercado: number): number {
  let weeklySalary = 0;
  if (valorMercado >= 1500000) {
    // S+ stars -> €18,000 to €28,000
    const ratio = Math.min(1, (valorMercado - 1500000) / 1000000);
    weeklySalary = 18000 + ratio * 10000;
    weeklySalary = Math.max(18000, Math.min(28000, weeklySalary));
  } else if (valorMercado >= 600000) {
    // Tier A -> €10,000 to €17,000
    const ratio = Math.min(1, (valorMercado - 600000) / 900000);
    weeklySalary = 10000 + ratio * 7000;
    weeklySalary = Math.max(10000, Math.min(17000, weeklySalary));
  } else {
    // Tier B/Academy -> €1,200 to €8,500
    const ratio = Math.min(1, Math.max(0, (valorMercado - 80000) / 520000));
    weeklySalary = 1200 + ratio * 7300;
    weeklySalary = Math.max(1200, Math.min(8500, weeklySalary));
  }
  return Math.round(weeklySalary);
}
