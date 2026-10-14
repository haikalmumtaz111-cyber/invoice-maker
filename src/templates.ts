import type { FontKey, LabelKey, LayoutKey, PaperKey, TemplateConfig, TemplateStyle } from './types';

export type LayoutCategory = 'formal' | 'modern' | 'kreatif' | 'minimal';

export const CATEGORIES: { key: LayoutCategory; name: string }[] = [
  { key: 'formal', name: 'Formal' },
  { key: 'modern', name: 'Modern' },
  { key: 'kreatif', name: 'Kreatif' },
  { key: 'minimal', name: 'Minimal' },
];

export const LAYOUTS: { key: LayoutKey; name: string; hint: string; category: LayoutCategory; logoAlign?: boolean }[] = [
  { key: 'arsip', name: 'Arsip', hint: 'Rapi dan formal, logo kiri, tabel bergaris tipis', category: 'formal', logoAlign: true },
  { key: 'kop', name: 'Kop Surat', hint: 'Kop perusahaan di tengah dengan garis ganda, tabel berkotak penuh', category: 'formal', logoAlign: true },
  { key: 'korporat', name: 'Korporat', hint: 'Strip info nomor, tanggal, dan total di bawah kepala', category: 'formal', logoAlign: true },
  { key: 'anggun', name: 'Anggun', hint: 'Serif, kepala di tengah, garis ganda', category: 'formal' },
  { key: 'bingkai', name: 'Bingkai', hint: 'Halaman berbingkai garis ganda, kesan klasik', category: 'formal' },
  { key: 'pita', name: 'Pita', hint: 'Kepala berwarna penuh, total di kotak warna', category: 'modern' },
  { key: 'kartu', name: 'Kartu', hint: 'Info klien dan tanggal dalam kartu membulat, gaya aplikasi', category: 'modern', logoAlign: true },
  { key: 'samping', name: 'Samping', hint: 'Kolom warna di kiri berisi pengirim dan pembayaran', category: 'modern' },
  { key: 'lengkung', name: 'Lengkung', hint: 'Kepala berwarna dengan lengkungan besar di sudut', category: 'modern' },
  { key: 'tegas', name: 'Tegas', hint: 'Judul besar, blok hitam untuk total tagihan', category: 'kreatif' },
  { key: 'studio', name: 'Studio', hint: 'Total tagihan raksasa di atas, gaya agensi kreatif', category: 'kreatif', logoAlign: true },
  { key: 'geometri', name: 'Geometri', hint: 'Bentuk lingkaran dan balok warna sebagai hiasan', category: 'kreatif' },
  { key: 'garis', name: 'Garis', hint: 'Minimal, banyak ruang, satu garis aksen', category: 'minimal' },
  { key: 'struk', name: 'Struk', hint: 'Padat ala nota, huruf monospace', category: 'minimal' },
];

export const FONTS: { key: FontKey; name: string; kind: 'sans' | 'serif' | 'mono' }[] = [
  { key: 'jakarta', name: 'Plus Jakarta Sans', kind: 'sans' },
  { key: 'inter', name: 'Inter', kind: 'sans' },
  { key: 'plex', name: 'IBM Plex Sans', kind: 'sans' },
  { key: 'grotesk', name: 'Space Grotesk', kind: 'sans' },
  { key: 'poppins', name: 'Poppins', kind: 'sans' },
  { key: 'montserrat', name: 'Montserrat', kind: 'sans' },
  { key: 'outfit', name: 'Outfit', kind: 'sans' },
  { key: 'helvetica', name: 'Helvetica', kind: 'sans' },
  { key: 'lora', name: 'Lora', kind: 'serif' },
  { key: 'playfair', name: 'Playfair Display', kind: 'serif' },
  { key: 'fraunces', name: 'Fraunces', kind: 'serif' },
  { key: 'dmserif', name: 'DM Serif Display', kind: 'serif' },
  { key: 'times', name: 'Times', kind: 'serif' },
  { key: 'mono', name: 'JetBrains Mono', kind: 'mono' },
  { key: 'spacemono', name: 'Space Mono', kind: 'mono' },
];

export const FONT_PAIRS: { name: string; heading: FontKey; body: FontKey }[] = [
  { name: 'Bersih', heading: 'jakarta', body: 'jakarta' },
  { name: 'Startup', heading: 'outfit', body: 'inter' },
  { name: 'Ramah', heading: 'poppins', body: 'poppins' },
  { name: 'Korporat', heading: 'montserrat', body: 'inter' },
  { name: 'Teknis', heading: 'grotesk', body: 'plex' },
  { name: 'Editorial', heading: 'fraunces', body: 'inter' },
  { name: 'Mewah', heading: 'dmserif', body: 'lora' },
  { name: 'Klasik', heading: 'playfair', body: 'lora' },
  { name: 'Mesin tik', heading: 'spacemono', body: 'mono' },
];

export const PALETTES: { name: string; primary: string; accent: string; paper?: string }[] = [
  { name: 'Tinta & tanah liat', primary: '#0a0a0a', accent: '#a4502f' },
  { name: 'Tanah liat', primary: '#a4502f', accent: '#0a0a0a' },
  { name: 'Hutan', primary: '#1f4d3a', accent: '#c08a2e' },
  { name: 'Navy & kuning', primary: '#14213d', accent: '#fca311' },
  { name: 'Biru tua', primary: '#1d3557', accent: '#e63946' },
  { name: 'Biru korporat', primary: '#0b3d91', accent: '#0891b2' },
  { name: 'Indigo', primary: '#3d3bb8', accent: '#f2a541' },
  { name: 'Ungu', primary: '#4c1d95', accent: '#f59e0b' },
  { name: 'Anggur', primary: '#5b1f3a', accent: '#d4a373' },
  { name: 'Mawar', primary: '#be123c', accent: '#1f2937' },
  { name: 'Senja', primary: '#ea580c', accent: '#1f2937' },
  { name: 'Teal', primary: '#0f5257', accent: '#e07a5f' },
  { name: 'Mint', primary: '#0f766e', accent: '#f59e0b' },
  { name: 'Laut', primary: '#0e7490', accent: '#f97316' },
  { name: 'Grafit', primary: '#2f3437', accent: '#3a7d44' },
  { name: 'Emas krem', primary: '#3f2a1d', accent: '#b08d57', paper: '#fdfaf3' },
];

export const PAPERS: { key: PaperKey; name: string }[] = [
  { key: 'A4', name: 'A4' },
  { key: 'F4', name: 'F4 / Folio' },
  { key: 'LETTER', name: 'Letter' },
  { key: 'LEGAL', name: 'Legal' },
  { key: 'A5', name: 'A5' },
];

export const LABEL_FIELDS: { key: LabelKey; name: string }[] = [
  { key: 'billTo', name: 'Ditagihkan kepada' },
  { key: 'from', name: 'Dari' },
  { key: 'issueDate', name: 'Tanggal' },
  { key: 'dueDate', name: 'Jatuh tempo' },
  { key: 'reference', name: 'Referensi' },
  { key: 'description', name: 'Kolom deskripsi' },
  { key: 'qty', name: 'Kolom qty' },
  { key: 'price', name: 'Kolom harga' },
  { key: 'amount', name: 'Kolom jumlah' },
  { key: 'subtotal', name: 'Subtotal' },
  { key: 'grandTotal', name: 'Total tagihan' },
  { key: 'balance', name: 'Sisa tagihan' },
  { key: 'terbilang', name: 'Terbilang' },
  { key: 'payTo', name: 'Pembayaran' },
  { key: 'notes', name: 'Catatan' },
  { key: 'terms', name: 'Syarat & ketentuan' },
  { key: 'regards', name: 'Salam penutup' },
];

const baseShow: TemplateConfig['show'] = {
  logo: true,
  businessName: true,
  businessDetails: true,
  clientDetails: true,
  reference: true,
  dueDate: true,
  itemNumber: true,
  itemDetail: true,
  qtyPrice: true,
  unit: true,
  terbilang: true,
  bankAccounts: true,
  qris: true,
  signature: true,
  stamp: true,
  notes: true,
  terms: true,
  paidStamp: true,
  pageNumber: true,
};

export const BASE_STYLE: TemplateStyle = {
  table: 'auto',
  radius: 'soft',
  margin: 'normal',
  fontScale: 1,
  accentBar: 'none',
  watermark: 'none',
  watermarkText: '',
  titleCase: 'normal',
};

// Templates saved before a field existed are filled in here, so every reader can rely on the full shape.
export function normalizeTemplate(t: TemplateConfig): TemplateConfig {
  const logoSize = t.logo?.size ?? 'm';
  return {
    ...t,
    logo: { align: t.logo?.align ?? 'left', size: logoSize },
    show: { ...baseShow, ...t.show },
    style: { ...BASE_STYLE, ...t.style },
    labels: { id: { ...t.labels?.id }, en: { ...t.labels?.en } },
    tagline: t.tagline ?? '',
    footer: t.footer ?? '',
    paper: t.paper ?? 'A4',
    density: t.density ?? 'normal',
  };
}

type PresetInput = Pick<TemplateConfig, 'id' | 'name' | 'layout' | 'colors' | 'fonts' | 'logo'> & {
  show?: Partial<TemplateConfig['show']>;
  style?: Partial<TemplateStyle>;
} & Partial<Omit<TemplateConfig, 'show' | 'style'>>;

function preset(p: PresetInput): TemplateConfig {
  return normalizeTemplate({
    builtin: true,
    paper: 'A4',
    density: 'normal',
    footer: '',
    tagline: '',
    labels: { id: {}, en: {} },
    titles: { id: 'INVOICE', en: 'INVOICE' },
    ...p,
    show: { ...baseShow, ...p.show },
    style: { ...BASE_STYLE, ...p.style },
  });
}

const ink = { text: '#1c1917', muted: '#57534e', paper: '#ffffff' };

export const BUILTIN_TEMPLATES: TemplateConfig[] = [
  preset({
    id: 'arsip',
    name: 'Arsip',
    layout: 'arsip',
    colors: { primary: '#0a0a0a', accent: '#b85b3a', ...ink },
    fonts: { heading: 'jakarta', body: 'jakarta' },
    logo: { align: 'left', size: 'm' },
  }),
  preset({
    id: 'kop-surat',
    name: 'Kop Surat',
    layout: 'kop',
    colors: { primary: '#111827', accent: '#1d4ed8', text: '#111827', muted: '#4b5563', paper: '#ffffff' },
    fonts: { heading: 'jakarta', body: 'inter' },
    logo: { align: 'left', size: 'l' },
    titles: { id: 'FAKTUR TAGIHAN', en: 'INVOICE' },
  }),
  preset({
    id: 'kop-hijau',
    name: 'Kop Hijau',
    layout: 'kop',
    colors: { primary: '#14532d', accent: '#ca8a04', text: '#1a2e22', muted: '#4b6355', paper: '#ffffff' },
    fonts: { heading: 'plex', body: 'plex' },
    logo: { align: 'left', size: 'l' },
  }),
  preset({
    id: 'korporat-biru',
    name: 'Korporat Biru',
    layout: 'korporat',
    colors: { primary: '#0b3d91', accent: '#0891b2', text: '#0f172a', muted: '#475569', paper: '#ffffff' },
    fonts: { heading: 'montserrat', body: 'inter' },
    logo: { align: 'left', size: 'm' },
    style: { table: 'zebra' },
  }),
  preset({
    id: 'korporat-grafit',
    name: 'Korporat Grafit',
    layout: 'korporat',
    colors: { primary: '#374151', accent: '#b91c1c', text: '#111827', muted: '#4b5563', paper: '#ffffff' },
    fonts: { heading: 'plex', body: 'plex' },
    logo: { align: 'left', size: 'm' },
  }),
  preset({
    id: 'anggun',
    name: 'Anggun',
    layout: 'anggun',
    colors: { primary: '#2b2118', accent: '#9a7b4f', text: '#2b2118', muted: '#6b5d4f', paper: '#fbf8f2' },
    fonts: { heading: 'playfair', body: 'lora' },
    logo: { align: 'center', size: 'm' },
    titles: { id: 'Invoice', en: 'Invoice' },
  }),
  preset({
    id: 'bingkai-klasik',
    name: 'Bingkai Klasik',
    layout: 'bingkai',
    colors: { primary: '#3f2a1d', accent: '#b08d57', text: '#2b1d14', muted: '#6b5a4b', paper: '#fdfaf3' },
    fonts: { heading: 'dmserif', body: 'lora' },
    logo: { align: 'center', size: 'm' },
    titles: { id: 'Invoice', en: 'Invoice' },
  }),
  preset({
    id: 'bingkai-navy',
    name: 'Bingkai Navy',
    layout: 'bingkai',
    colors: { primary: '#1e2a4a', accent: '#c9a227', text: '#1e2a4a', muted: '#5a6378', paper: '#ffffff' },
    fonts: { heading: 'fraunces', body: 'inter' },
    logo: { align: 'center', size: 'm' },
  }),
  preset({
    id: 'pita-tanah',
    name: 'Pita Tanah Liat',
    layout: 'pita',
    colors: { primary: '#a4502f', accent: '#0a0a0a', ...ink },
    fonts: { heading: 'jakarta', body: 'inter' },
    logo: { align: 'left', size: 'm' },
  }),
  preset({
    id: 'pita-hutan',
    name: 'Pita Hutan',
    layout: 'pita',
    colors: { primary: '#1f4d3a', accent: '#c08a2e', text: '#1a1f1c', muted: '#52605a', paper: '#ffffff' },
    fonts: { heading: 'plex', body: 'plex' },
    logo: { align: 'left', size: 'm' },
  }),
  preset({
    id: 'pita-anggur',
    name: 'Pita Anggur',
    layout: 'pita',
    colors: { primary: '#4c1d95', accent: '#f59e0b', text: '#1e1b2e', muted: '#5b5670', paper: '#ffffff' },
    fonts: { heading: 'fraunces', body: 'inter' },
    logo: { align: 'left', size: 'm' },
    style: { table: 'zebra' },
  }),
  preset({
    id: 'kartu-indigo',
    name: 'Kartu Indigo',
    layout: 'kartu',
    colors: { primary: '#3d3bb8', accent: '#f2a541', text: '#1b1b3a', muted: '#5b5d7a', paper: '#ffffff' },
    fonts: { heading: 'outfit', body: 'inter' },
    logo: { align: 'left', size: 'm' },
    style: { radius: 'round' },
  }),
  preset({
    id: 'kartu-mint',
    name: 'Kartu Mint',
    layout: 'kartu',
    colors: { primary: '#0f766e', accent: '#f59e0b', text: '#12312e', muted: '#4d6663', paper: '#ffffff' },
    fonts: { heading: 'poppins', body: 'poppins' },
    logo: { align: 'left', size: 'm' },
    style: { radius: 'round' },
  }),
  preset({
    id: 'samping-navy',
    name: 'Samping Navy',
    layout: 'samping',
    colors: { primary: '#14213d', accent: '#fca311', text: '#14213d', muted: '#5c6478', paper: '#ffffff' },
    fonts: { heading: 'jakarta', body: 'jakarta' },
    logo: { align: 'left', size: 'm' },
  }),
  preset({
    id: 'lengkung-senja',
    name: 'Lengkung Senja',
    layout: 'lengkung',
    colors: { primary: '#ea580c', accent: '#1f2937', text: '#1f2937', muted: '#5b6472', paper: '#ffffff' },
    fonts: { heading: 'poppins', body: 'inter' },
    logo: { align: 'left', size: 'm' },
  }),
  preset({
    id: 'lengkung-laut',
    name: 'Lengkung Laut',
    layout: 'lengkung',
    colors: { primary: '#0e7490', accent: '#f97316', text: '#0f2a33', muted: '#4b6470', paper: '#ffffff' },
    fonts: { heading: 'montserrat', body: 'inter' },
    logo: { align: 'left', size: 'm' },
  }),
  preset({
    id: 'tegas',
    name: 'Tegas',
    layout: 'tegas',
    colors: { primary: '#0a0a0a', accent: '#e4572e', text: '#0a0a0a', muted: '#555555', paper: '#ffffff' },
    fonts: { heading: 'grotesk', body: 'grotesk' },
    logo: { align: 'right', size: 'm' },
  }),
  preset({
    id: 'studio',
    name: 'Studio',
    layout: 'studio',
    colors: { primary: '#0a0a0a', accent: '#ff4f00', text: '#0a0a0a', muted: '#5c5c5c', paper: '#ffffff' },
    fonts: { heading: 'grotesk', body: 'inter' },
    logo: { align: 'left', size: 's' },
    style: { table: 'minimal' },
  }),
  preset({
    id: 'studio-ungu',
    name: 'Studio Ungu',
    layout: 'studio',
    colors: { primary: '#2e1065', accent: '#a855f7', text: '#1e1033', muted: '#5f5276', paper: '#faf7ff' },
    fonts: { heading: 'outfit', body: 'outfit' },
    logo: { align: 'left', size: 's' },
    style: { table: 'minimal' },
  }),
  preset({
    id: 'geometri-pop',
    name: 'Geometri Pop',
    layout: 'geometri',
    colors: { primary: '#e11d48', accent: '#2563eb', text: '#18181b', muted: '#52525b', paper: '#ffffff' },
    fonts: { heading: 'grotesk', body: 'inter' },
    logo: { align: 'left', size: 'm' },
  }),
  preset({
    id: 'geometri-daun',
    name: 'Geometri Daun',
    layout: 'geometri',
    colors: { primary: '#166534', accent: '#eab308', text: '#14251a', muted: '#4f6255', paper: '#ffffff' },
    fonts: { heading: 'outfit', body: 'outfit' },
    logo: { align: 'left', size: 'm' },
  }),
  preset({
    id: 'garis',
    name: 'Garis',
    layout: 'garis',
    colors: { primary: '#111111', accent: '#2f5bd3', text: '#111111', muted: '#5f6368', paper: '#ffffff' },
    fonts: { heading: 'inter', body: 'inter' },
    logo: { align: 'left', size: 's' },
    show: { itemNumber: false },
  }),
  preset({
    id: 'garis-mesin-tik',
    name: 'Garis Mesin Tik',
    layout: 'garis',
    colors: { primary: '#1a1a1a', accent: '#d64933', text: '#1a1a1a', muted: '#5e5e5e', paper: '#fbfaf6' },
    fonts: { heading: 'spacemono', body: 'spacemono' },
    logo: { align: 'left', size: 's' },
    show: { itemNumber: false },
    style: { table: 'minimal', titleCase: 'upper', fontScale: 0.92 },
  }),
  preset({
    id: 'struk',
    name: 'Struk',
    layout: 'struk',
    colors: { primary: '#111111', accent: '#111111', text: '#111111', muted: '#555555', paper: '#ffffff' },
    fonts: { heading: 'mono', body: 'mono' },
    logo: { align: 'center', size: 's' },
    density: 'compact',
    show: { itemNumber: false, stamp: false },
    titles: { id: 'NOTA TAGIHAN', en: 'BILL' },
  }),
];

export const DEFAULT_TEMPLATE_ID = 'arsip';
