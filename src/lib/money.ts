import type { Discount, Invoice, Lang, LineItem } from '../types';

export const CURRENCIES = [
  { code: 'IDR', name: 'Rupiah' },
  { code: 'USD', name: 'US Dollar' },
  { code: 'SGD', name: 'Singapore Dollar' },
  { code: 'MYR', name: 'Ringgit' },
  { code: 'EUR', name: 'Euro' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'JPY', name: 'Yen' },
];

const localeOf = (lang: Lang) => (lang === 'id' ? 'id-ID' : 'en-US');

export function decimalsOf(currency: string): number {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

// IDR is shown without cents even though ISO 4217 defines two decimals.
export function displayDecimals(currency: string): number {
  return currency === 'IDR' ? 0 : decimalsOf(currency);
}

export function formatMoney(amount: number, currency: string, lang: Lang = 'id'): string {
  const d = displayDecimals(currency);
  try {
    return new Intl.NumberFormat(localeOf(lang), {
      style: 'currency',
      currency,
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    })
      .format(amount)
      .replace(/ /g, ' ');
  } catch {
    return `${currency} ${formatNumber(amount, lang, d)}`;
  }
}

export function formatNumber(n: number, lang: Lang = 'id', maxDecimals = 2): string {
  return new Intl.NumberFormat(localeOf(lang), { maximumFractionDigits: maxDecimals }).format(n);
}

// Pasted values often use the other locale's separators (Excel in English, bank statements), so the
// decimal separator is guessed from the text: a lone foreign separator followed by exactly 3 digits is a thousands mark.
export function parseNumber(input: string, lang: Lang = 'id'): number {
  let s = input.replace(/[^\d.,-]/g, '');
  const negative = s.startsWith('-');
  s = s.replace(/-/g, '');
  const native = lang === 'id' ? ',' : '.';
  const dots = s.split('.').length - 1;
  const commas = s.split(',').length - 1;
  let decimal: string | null = null;
  if (dots && commas) decimal = s.lastIndexOf('.') > s.lastIndexOf(',') ? '.' : ',';
  else if (dots + commas === 1) {
    const sep = dots ? '.' : ',';
    const after = s.length - s.indexOf(sep) - 1;
    decimal = sep === native || after !== 3 ? sep : null;
  }
  const thousands = decimal === '.' ? ',' : decimal === ',' ? '.' : /[.,]/g;
  s = s.replace(typeof thousands === 'string' ? new RegExp(`\\${thousands}`, 'g') : thousands, '');
  if (decimal) s = s.replace(decimal, '.');
  const n = parseFloat(s);
  if (!Number.isFinite(n)) return 0;
  return negative ? -n : n;
}

function round(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round((n + Number.EPSILON) * f) / f;
}

function applyDiscount(base: number, discount: Discount, decimals: number): number {
  if (!discount.value) return 0;
  const raw = discount.type === 'percent' ? (base * Math.min(discount.value, 100)) / 100 : discount.value;
  return round(Math.min(raw, base), decimals);
}

export function lineTotals(item: LineItem, currency: string) {
  const d = displayDecimals(currency);
  const gross = round((item.qty || 0) * (item.price || 0), d);
  const discount = applyDiscount(gross, item.discount, d);
  return { gross, discount, net: round(gross - discount, d) };
}

export interface Totals {
  subtotal: number;
  lineDiscounts: number;
  discount: number;
  afterDiscount: number;
  taxBase: number;
  tax: number;
  total: number;
  pph: number;
  adjustments: number;
  grandTotal: number;
  paid: number;
  balance: number;
}

export function computeTotals(inv: Pick<Invoice, 'items' | 'discount' | 'tax' | 'pph' | 'adjustments' | 'payments' | 'currency'>): Totals {
  const d = displayDecimals(inv.currency);
  let subtotal = 0;
  let lineDiscounts = 0;
  for (const item of inv.items) {
    const t = lineTotals(item, inv.currency);
    subtotal += t.net;
    lineDiscounts += t.discount;
  }
  subtotal = round(subtotal, d);
  const discount = applyDiscount(subtotal, inv.discount, d);
  const afterDiscount = round(subtotal - discount, d);

  let taxBase = afterDiscount;
  let tax = 0;
  let total = afterDiscount;
  if (inv.tax.enabled && inv.tax.rate > 0) {
    const r = inv.tax.rate / 100;
    if (inv.tax.inclusive) {
      taxBase = round(afterDiscount / (1 + r), d);
      tax = round(afterDiscount - taxBase, d);
      total = afterDiscount;
    } else {
      tax = round(afterDiscount * r, d);
      total = round(afterDiscount + tax, d);
    }
  }

  // Withholding tax (PPh) is cut from the pre-VAT base, not from the VAT-inclusive total.
  const pph = inv.pph.enabled && inv.pph.rate > 0 ? round((taxBase * inv.pph.rate) / 100, d) : 0;
  const adjustments = round(inv.adjustments.reduce((s, a) => s + (a.kind === 'less' ? -1 : 1) * Math.abs(a.amount || 0), 0), d);
  const grandTotal = round(total - pph + adjustments, d);
  const paid = round(inv.payments.reduce((s, p) => s + (p.amount || 0), 0), d);
  const balance = round(grandTotal - paid, d);

  return { subtotal, lineDiscounts, discount, afterDiscount, taxBase, tax, total, pph, adjustments, grandTotal, paid, balance };
}
