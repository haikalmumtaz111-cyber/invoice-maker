import type { NumberingRule } from '../types';

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export function periodKey(rule: NumberingRule, dateISO: string): string {
  const [y, m] = dateISO.split('-');
  if (rule.reset === 'yearly') return y;
  if (rule.reset === 'monthly') return `${y}-${m}`;
  return 'all';
}

export function formatNumberPattern(format: string, dateISO: string, seq: number, clientCode = ''): string {
  const [y, m, d] = dateISO.split('-');
  return format
    .replace(/\{YYYY\}/g, y)
    .replace(/\{YY\}/g, y.slice(2))
    .replace(/\{MM\}/g, m)
    .replace(/\{ROMAN\}/g, ROMAN[Number(m) - 1])
    .replace(/\{DD\}/g, d)
    .replace(/\{CLIENT\}/g, clientCode)
    .replace(/\{SEQ(?::(\d))?\}/g, (_, pad) => String(seq).padStart(pad ? Number(pad) : 1, '0'));
}

export function peekNext(rule: NumberingRule, dateISO: string) {
  const key = periodKey(rule, dateISO);
  const seq = (rule.counters[key] ?? 0) + 1;
  return { key, seq, number: formatNumberPattern(rule.format, dateISO, seq) };
}

export function clientCode(name: string): string {
  const words = name
    .replace(/^(pt|cv|ud|tbk)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

export const NUMBER_TOKENS = [
  { token: '{YYYY}', label: 'Tahun 4 digit' },
  { token: '{YY}', label: 'Tahun 2 digit' },
  { token: '{MM}', label: 'Bulan' },
  { token: '{ROMAN}', label: 'Bulan romawi' },
  { token: '{DD}', label: 'Tanggal' },
  { token: '{SEQ:3}', label: 'Urutan (3 digit)' },
  { token: '{CLIENT}', label: 'Kode klien' },
];
