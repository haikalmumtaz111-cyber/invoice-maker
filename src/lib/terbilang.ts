import type { Lang } from '../types';
import { displayDecimals } from './money';

const ID_UNITS = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

function idWords(n: number): string {
  if (n < 12) return ID_UNITS[n];
  if (n < 20) return `${ID_UNITS[n - 10]} belas`;
  if (n < 100) return `${ID_UNITS[Math.floor(n / 10)]} puluh ${idWords(n % 10)}`.trim();
  if (n < 200) return `seratus ${idWords(n - 100)}`.trim();
  if (n < 1000) return `${ID_UNITS[Math.floor(n / 100)]} ratus ${idWords(n % 100)}`.trim();
  if (n < 2000) return `seribu ${idWords(n - 1000)}`.trim();
  const scales: [number, string][] = [
    [1e12, 'triliun'],
    [1e9, 'miliar'],
    [1e6, 'juta'],
    [1e3, 'ribu'],
  ];
  for (const [value, name] of scales) {
    if (n >= value) {
      return `${idWords(Math.floor(n / value))} ${name} ${idWords(n % value)}`.trim();
    }
  }
  return '';
}

const EN_SMALL = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

function enWords(n: number): string {
  if (n < 20) return EN_SMALL[n];
  if (n < 100) return EN_TENS[Math.floor(n / 10)] + (n % 10 ? `-${EN_SMALL[n % 10]}` : '');
  if (n < 1000) return `${EN_SMALL[Math.floor(n / 100)]} hundred${n % 100 ? ` ${enWords(n % 100)}` : ''}`;
  const scales: [number, string][] = [
    [1e12, 'trillion'],
    [1e9, 'billion'],
    [1e6, 'million'],
    [1e3, 'thousand'],
  ];
  for (const [value, name] of scales) {
    if (n >= value) {
      const rest = n % value;
      return `${enWords(Math.floor(n / value))} ${name}${rest ? ` ${enWords(rest)}` : ''}`;
    }
  }
  return '';
}

const CURRENCY_WORDS: Record<string, { id: [string, string]; en: [string, string] }> = {
  IDR: { id: ['rupiah', 'sen'], en: ['rupiah', 'cents'] },
  USD: { id: ['dolar AS', 'sen'], en: ['US dollars', 'cents'] },
  SGD: { id: ['dolar Singapura', 'sen'], en: ['Singapore dollars', 'cents'] },
  MYR: { id: ['ringgit', 'sen'], en: ['ringgit', 'sen'] },
  EUR: { id: ['euro', 'sen'], en: ['euros', 'cents'] },
  AUD: { id: ['dolar Australia', 'sen'], en: ['Australian dollars', 'cents'] },
  JPY: { id: ['yen', ''], en: ['yen', ''] },
};

export function terbilang(amount: number, currency: string, lang: Lang): string {
  const negative = amount < 0;
  const abs = Math.abs(amount);
  const d = displayDecimals(currency);
  const whole = Math.floor(abs);
  const fraction = d > 0 ? Math.round((abs - whole) * 10 ** d) : 0;
  const words = CURRENCY_WORDS[currency]?.[lang] ?? [currency, ''];
  const toWords = lang === 'id' ? idWords : enWords;
  const zero = lang === 'id' ? 'nol' : 'zero';

  let out = `${whole === 0 ? zero : toWords(whole)} ${words[0]}`;
  if (fraction > 0 && words[1]) {
    out += lang === 'id' ? ` ${toWords(fraction)} ${words[1]}` : ` and ${toWords(fraction)} ${words[1]}`;
  }
  if (negative) out = (lang === 'id' ? 'minus ' : 'minus ') + out;
  return out.charAt(0).toUpperCase() + out.slice(1);
}
