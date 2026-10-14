import type { Invoice, Lang, LineItem, Settings } from '../types';
import { addDays, todayISO } from './id';
import { computeTotals } from './money';

export interface SampleOptions {
  lang?: Lang;
  long?: boolean;
  paid?: boolean;
}

const EXTRA: [string, number, string, number][] = [
  ['Riset & wawancara pengguna', 2, 'hari', 1200000],
  ['Desain antarmuka aplikasi', 1, 'paket', 4500000],
  ['Pengembangan halaman depan', 24, 'jam', 175000],
  ['Integrasi pembayaran', 1, 'paket', 2000000],
  ['Pengujian & perbaikan bug', 12, 'jam', 150000],
  ['Hosting tahunan', 1, 'tahun', 1800000],
  ['Domain .co.id', 1, 'tahun', 300000],
  ['Pelatihan admin', 2, 'sesi', 750000],
  ['Dokumentasi teknis', 1, 'paket', 900000],
  ['Dukungan pasca rilis', 3, 'bulan', 600000],
  ['Penulisan konten', 10, 'halaman', 125000],
  ['Foto produk', 20, 'foto', 50000],
];

export function sampleInvoice(s: Settings, templateId: string, opts: SampleOptions = {}): Invoice {
  const issue = todayISO();
  const extra: LineItem[] = opts.long
    ? EXTRA.map(([description, qty, unit, price], i) => ({ id: `x${i}`, description, detail: '', qty, unit, price, discount: { type: 'percent', value: 0 } }))
    : [];
  const inv: Invoice = {
    id: 'sample',
    number: `INV/${issue.slice(0, 4)}/${issue.slice(5, 7)}/017`,
    title: '',
    reference: 'PO-2291',
    status: 'sent',
    issueDate: issue,
    dueDate: addDays(issue, s.defaults.dueDays),
    client: {
      name: 'PT Maju Bersama Indonesia',
      contactPerson: 'Ibu Sari Wulandari',
      email: 'finance@majubersama.co.id',
      phone: '021-5550-1234',
      address: 'Gedung Graha Niaga Lt. 8, Jl. Jend. Sudirman Kav. 58, Jakarta Selatan',
      taxId: '',
    },
    items: [
      { id: 'a', description: 'Desain identitas visual', detail: 'Logo, palet warna, tipografi, dan panduan merek', qty: 1, unit: 'paket', price: 4500000, discount: { type: 'percent', value: 0 } },
      { id: 'b', description: 'Website company profile', detail: '5 halaman, responsif, termasuk CMS', qty: 1, unit: 'paket', price: 7500000, discount: { type: 'percent', value: 0 } },
      { id: 'c', description: 'Foto produk', detail: 'Studio, sudah diedit', qty: 20, unit: 'foto', price: 75000, discount: { type: 'percent', value: 0 } },
      { id: 'd', description: 'Pemeliharaan website', qty: 3, unit: 'bulan', detail: '', price: 500000, discount: { type: 'percent', value: 0 } },
      ...extra,
    ],
    discount: { type: 'percent', value: 0 },
    tax: { enabled: s.defaults.taxEnabled, label: s.defaults.taxLabel, rate: s.defaults.taxRate, inclusive: s.defaults.taxInclusive },
    pph: { enabled: false, label: s.defaults.pphLabel, rate: s.defaults.pphRate },
    adjustments: [],
    currency: s.defaults.currency,
    lang: opts.lang ?? s.defaults.lang,
    templateId,
    notes: s.defaults.notes || 'Terima kasih atas kepercayaannya. Senang bisa bekerja sama.',
    terms: s.defaults.terms || 'Pembayaran paling lambat sesuai tanggal jatuh tempo. Mohon cantumkan nomor invoice pada berita transfer.',
    bankAccountIds: s.bankAccounts.map((b) => b.id),
    showQris: !!s.qris,
    payments: [],
    createdAt: 0,
    updatedAt: 0,
  };
  if (opts.paid) inv.payments = [{ id: 'p', date: issue, amount: computeTotals(inv).grandTotal, method: 'Transfer bank', note: '' }];
  return inv;
}

let demoLogo: string | undefined;

// A plain monogram, drawn once, so template previews show where a logo goes instead of an empty corner.
function monogram(): string | undefined {
  if (demoLogo !== undefined || typeof document === 'undefined') return demoLogo;
  try {
    const c = document.createElement('canvas');
    c.width = 240;
    c.height = 240;
    const g = c.getContext('2d')!;
    g.fillStyle = '#1c1917';
    g.beginPath();
    g.roundRect(0, 0, 240, 240, 56);
    g.fill();
    g.fillStyle = '#ffffff';
    g.font = 'bold 112px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText('SN', 120, 128);
    demoLogo = c.toDataURL('image/png');
  } catch {
    demoLogo = '';
  }
  return demoLogo || undefined;
}

export function sampleSettings(s: Settings): Settings {
  if (s.business.name) return s;
  return {
    ...s,
    business: {
      ...s.business,
      name: 'Studio Nusantara',
      address: 'Jl. Kemang Raya No. 12, Jakarta Selatan 12730',
      phone: '0812-3456-7890',
      email: 'halo@studionusantara.id',
      website: 'studionusantara.id',
      logo: s.business.logo ?? monogram(),
    },
    signature: { ...s.signature, name: s.signature.name || 'Rizky Pratama', title: s.signature.title || 'Pemilik' },
    bankAccounts: s.bankAccounts.length ? s.bankAccounts : [{ id: 'sample-bank', bank: 'BCA', number: '123 456 7890', holder: 'Studio Nusantara' }],
  };
}
