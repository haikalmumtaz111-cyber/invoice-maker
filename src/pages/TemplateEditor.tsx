import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db, updateSettings } from '../db';
import { useInvoicePdf, useSettings, useWide } from '../hooks';
import { sampleInvoice, sampleSettings } from '../lib/sample';
import { contrastRatio, logoColors } from '../lib/files';
import { docLabels } from '../lib/labels';
import { BUILTIN_TEMPLATES, CATEGORIES, FONTS, FONT_PAIRS, LABEL_FIELDS, LAYOUTS, PALETTES, PAPERS, normalizeTemplate, type LayoutCategory } from '../templates';
import type { FontKey, Lang, TemplateConfig, TemplateStyle } from '../types';
import { PageHeader } from '../components/layout';
import { Button, Card, EmptyState, Field, Loading, Segmented, Select, TextInput, Toggle, useUI } from '../components/ui';
import { PdfPreview } from '../components/PdfPreview';
import { LayoutSketch } from '../components/LayoutSketch';

type Tab = 'gaya' | 'warna' | 'huruf' | 'konten' | 'label' | 'kertas';

const TABS: { value: Tab; label: string }[] = [
  { value: 'gaya', label: 'Gaya' },
  { value: 'warna', label: 'Warna' },
  { value: 'huruf', label: 'Huruf' },
  { value: 'konten', label: 'Konten' },
  { value: 'label', label: 'Label' },
  { value: 'kertas', label: 'Kertas' },
];

type ShowKey = keyof TemplateConfig['show'];

const SHOW_GROUPS: { title: string; items: [ShowKey, string, string?][] }[] = [
  {
    title: 'Kepala dokumen',
    items: [
      ['logo', 'Logo'],
      ['businessName', 'Nama usaha'],
      ['businessDetails', 'Alamat & kontak usaha'],
      ['clientDetails', 'Alamat & kontak klien'],
      ['dueDate', 'Tanggal jatuh tempo'],
      ['reference', 'Referensi / No. PO'],
    ],
  },
  {
    title: 'Tabel item',
    items: [
      ['itemNumber', 'Nomor urut item'],
      ['itemDetail', 'Keterangan di bawah item'],
      ['qtyPrice', 'Kolom qty & harga satuan', 'Matikan untuk tagihan jasa borongan yang hanya perlu deskripsi dan jumlah'],
      ['unit', 'Satuan di kolom qty'],
    ],
  },
  {
    title: 'Bagian bawah',
    items: [
      ['terbilang', 'Terbilang'],
      ['bankAccounts', 'Rekening bank'],
      ['qris', 'QRIS'],
      ['signature', 'Tanda tangan'],
      ['stamp', 'Stempel'],
      ['notes', 'Catatan'],
      ['terms', 'Syarat & ketentuan'],
      ['paidStamp', 'Cap LUNAS saat sudah dibayar'],
      ['pageNumber', 'Nomor halaman'],
    ],
  },
];

function Chips<T extends string | number>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-9 rounded-lg border px-3 text-xs font-semibold transition-colors ${value === o.value ? 'border-ink bg-ink text-bg' : 'border-line bg-surface text-muted hover:text-text'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Section({ title, hint, children, action }: { title: string; hint?: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <Card>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-bold">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
        </div>
        {action}
      </div>
      {children}
    </Card>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input type="color" aria-label={`${label}, pilih warna`} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 w-12 shrink-0 cursor-pointer rounded-xl border border-line bg-surface p-1" />
        <TextInput
          aria-label={`${label}, kode hex`}
          className="font-mono uppercase"
          value={text}
          maxLength={7}
          onChange={(e) => {
            const v = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
            setText(v);
            if (/^#[0-9a-fA-F]{6}$/.test(v)) onChange(v.toLowerCase());
          }}
        />
      </div>
    </Field>
  );
}

export function TemplateEditor() {
  const { id } = useParams();
  const { toast } = useUI();
  const settings = useSettings();
  const [tpl, setTpl] = useState<TemplateConfig | null | undefined>(undefined);
  const [saved, setSaved] = useState(true);
  const [tab, setTab] = useState<Tab>('gaya');
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');
  const [category, setCategory] = useState<LayoutCategory | 'all'>('all');
  const [labelLang, setLabelLang] = useState<Lang>('id');
  const [pv, setPv] = useState<{ lang: Lang; long: boolean; paid: boolean }>({ lang: 'id', long: false, paid: false });
  const [, force] = useState(0);
  const dirty = useRef(false);
  const past = useRef<TemplateConfig[]>([]);
  const future = useRef<TemplateConfig[]>([]);
  const lastPush = useRef(0);
  const wide = useWide();

  useEffect(() => {
    db.templates.get(id!).then((t) => setTpl(t ? normalizeTemplate(t) : null));
  }, [id]);

  useEffect(() => {
    if (settings) setPv((p) => ({ ...p, lang: settings.defaults.lang }));
  }, [!!settings]);

  useEffect(() => {
    if (!tpl || !dirty.current) return;
    setSaved(false);
    const t = setTimeout(() => db.templates.put(tpl).then(() => setSaved(true)), 400);
    return () => clearTimeout(t);
  }, [tpl]);

  const undo = () => {
    const prev = past.current.pop();
    if (!prev || !tpl) return;
    future.current.push(tpl);
    dirty.current = true;
    lastPush.current = 0;
    setTpl({ ...prev, updatedAt: Date.now() });
  };
  const redo = () => {
    const next = future.current.pop();
    if (!next || !tpl) return;
    past.current.push(tpl);
    dirty.current = true;
    lastPush.current = 0;
    setTpl({ ...next, updatedAt: Date.now() });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'z' || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const ss = useMemo(() => (settings ? sampleSettings(settings) : undefined), [settings]);
  const sample = useMemo(() => (ss && tpl ? sampleInvoice(ss, tpl.id, pv) : undefined), [ss, tpl?.id, pv]);
  const pdf = useInvoicePdf(wide || mobileView === 'preview' ? sample : undefined, tpl ?? undefined, ss, pv.paid ? 'paid' : 'sent', 400);

  if (tpl === undefined || !settings) return <Loading />;
  if (tpl === null)
    return (
      <EmptyState
        title="Template tidak ditemukan"
        body="Template bawaan tidak bisa diubah langsung. Buka halaman Template lalu pilih 'Buat versiku'."
        action={
          <Link to="/template" className="rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-bg">
            Ke halaman template
          </Link>
        }
      />
    );

  // Edits within half a second of each other (typing, dragging a colour) collapse into one undo step.
  const set = (patch: Partial<TemplateConfig>) => {
    dirty.current = true;
    const now = Date.now();
    if (now - lastPush.current > 500) {
      past.current.push(tpl);
      if (past.current.length > 60) past.current.shift();
      future.current = [];
    }
    lastPush.current = now;
    setTpl((t) => (t ? { ...t, ...patch, updatedAt: now } : t));
    force((n) => n + 1);
  };
  const setColor = (k: keyof TemplateConfig['colors'], v: string) => set({ colors: { ...tpl.colors, [k]: v } });
  const setStyle = <K extends keyof TemplateStyle>(k: K, v: TemplateStyle[K]) => set({ style: { ...tpl.style, [k]: v } });
  const base = BUILTIN_TEMPLATES.find((b) => b.id === tpl.baseId);
  const layoutMeta = LAYOUTS.find((l) => l.key === tpl.layout);
  const textContrast = contrastRatio(tpl.colors.text, tpl.colors.paper);
  const titleContrast = contrastRatio(tpl.colors.primary, tpl.colors.paper);

  const pickFromLogo = async () => {
    if (!settings.business.logo) return;
    try {
      const [primary, accent] = await logoColors(settings.business.logo);
      if (!primary) {
        toast('Logo tidak punya warna yang cukup kuat untuk diambil.', 'error');
        return;
      }
      set({ colors: { ...tpl.colors, primary, accent: accent ?? tpl.colors.accent } });
      toast(accent ? 'Warna utama dan aksen diambil dari logo' : 'Warna utama diambil dari logo');
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  const layoutsShown = LAYOUTS.filter((l) => category === 'all' || l.category === category);

  const panels: Record<Tab, ReactNode> = {
    gaya: (
      <>
        <Section title="Layout" hint="Susunan dasar halaman. Warna, huruf, dan isi tetap bisa diatur sendiri.">
          <div className="mb-3">
            <Chips
              label="Kategori layout"
              value={category}
              onChange={setCategory}
              options={[{ value: 'all' as const, label: 'Semua' }, ...CATEGORIES.map((c) => ({ value: c.key, label: c.name }))]}
            />
          </div>
          <div role="radiogroup" aria-label="Layout" className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
            {layoutsShown.map((l) => (
              <button
                key={l.key}
                type="button"
                role="radio"
                aria-checked={tpl.layout === l.key}
                title={l.hint}
                onClick={() => set({ layout: l.key })}
                className={`rounded-xl border p-1.5 text-left transition-colors ${tpl.layout === l.key ? 'border-ink ring-2 ring-ink/15' : 'border-line hover:border-muted/60'}`}
              >
                <LayoutSketch layout={l.key} colors={tpl.colors} />
                <span className="mt-1.5 block truncate px-0.5 text-xs font-bold">{l.name}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">{layoutMeta?.hint}</p>
        </Section>

        <Section title="Gaya tabel item" hint="Otomatis mengikuti layout, atau pilih sendiri.">
          <Chips
            label="Gaya tabel"
            value={tpl.style.table}
            onChange={(v) => setStyle('table', v)}
            options={[
              { value: 'auto', label: 'Ikut layout' },
              { value: 'lines', label: 'Garis' },
              { value: 'zebra', label: 'Belang' },
              { value: 'grid', label: 'Kotak penuh' },
              { value: 'filled', label: 'Kepala berwarna' },
              { value: 'minimal', label: 'Minimal' },
            ]}
          />
        </Section>

        <Section title="Detail tampilan">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Sudut kotak">
              <Segmented
                label="Sudut kotak"
                value={tpl.style.radius}
                onChange={(v) => setStyle('radius', v)}
                options={[
                  { value: 'none', label: 'Tajam' },
                  { value: 'soft', label: 'Halus' },
                  { value: 'round', label: 'Bulat' },
                ]}
              />
            </Field>
            <Field label="Garis aksen di tepi halaman">
              <Segmented
                label="Garis aksen"
                value={tpl.style.accentBar}
                onChange={(v) => setStyle('accentBar', v)}
                options={[
                  { value: 'none', label: 'Tidak ada' },
                  { value: 'top', label: 'Atas' },
                  { value: 'side', label: 'Samping' },
                ]}
              />
            </Field>
            <Field label="Watermark">
              <Segmented
                label="Watermark"
                value={tpl.style.watermark}
                onChange={(v) => setStyle('watermark', v)}
                options={[
                  { value: 'none', label: 'Tidak ada' },
                  { value: 'logo', label: 'Logo' },
                  { value: 'text', label: 'Teks' },
                ]}
              />
            </Field>
            {tpl.style.watermark === 'text' ? (
              <Field label="Teks watermark" htmlFor="t-wm" hint="Kosongkan untuk pakai nama usaha">
                <TextInput id="t-wm" value={tpl.style.watermarkText} placeholder={settings.business.name || 'RAHASIA'} onChange={(e) => setStyle('watermarkText', e.target.value)} />
              </Field>
            ) : tpl.style.watermark === 'logo' && !settings.business.logo ? (
              <p className="self-end text-xs text-warn">Logo belum diunggah di Pengaturan.</p>
            ) : (
              <div />
            )}
          </div>
        </Section>
      </>
    ),

    warna: (
      <>
        <Section
          title="Palet siap pakai"
          action={
            settings.business.logo ? (
              <Button size="sm" onClick={pickFromLogo}>
                Ambil dari logo
              </Button>
            ) : undefined
          }
        >
          <div className="flex flex-wrap gap-2">
            {PALETTES.map((p) => (
              <button
                key={p.name}
                type="button"
                title={p.name}
                aria-label={`Palet ${p.name}`}
                onClick={() => set({ colors: { ...tpl.colors, primary: p.primary, accent: p.accent, paper: p.paper ?? '#ffffff' } })}
                className={`flex h-10 overflow-hidden rounded-lg border-2 ${tpl.colors.primary === p.primary && tpl.colors.accent === p.accent ? 'border-clay' : 'border-line'}`}
              >
                <span className="w-7" style={{ background: p.primary }} />
                <span className="w-4" style={{ background: p.accent }} />
              </button>
            ))}
          </div>
        </Section>
        <Section
          title="Warna sendiri"
          action={
            base ? (
              <Button size="sm" variant="ghost" onClick={() => set({ colors: { ...base.colors } })}>
                Kembalikan warna asal
              </Button>
            ) : undefined
          }
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <ColorField label="Warna utama" value={tpl.colors.primary} onChange={(v) => setColor('primary', v)} />
            <ColorField label="Aksen" value={tpl.colors.accent} onChange={(v) => setColor('accent', v)} />
            <ColorField label="Teks" value={tpl.colors.text} onChange={(v) => setColor('text', v)} />
            <ColorField label="Teks sekunder" value={tpl.colors.muted} onChange={(v) => setColor('muted', v)} />
            <ColorField label="Kertas" value={tpl.colors.paper} onChange={(v) => setColor('paper', v)} />
          </div>
          {(textContrast < 4.5 || titleContrast < 3) && (
            <p className="mt-3 rounded-xl bg-warn/10 p-3 text-xs font-semibold text-warn">
              {textContrast < 4.5 ? 'Teks kurang kontras dengan warna kertas, bisa sulit dibaca saat dicetak. ' : ''}
              {titleContrast < 3 ? 'Warna utama terlalu mirip warna kertas, judul jadi samar.' : ''}
            </p>
          )}
        </Section>
      </>
    ),

    huruf: (
      <>
        <Section title="Pasangan huruf" hint="Kombinasi judul dan isi yang sudah serasi.">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {FONT_PAIRS.map((f) => {
              const active = tpl.fonts.heading === f.heading && tpl.fonts.body === f.body;
              return (
                <button
                  key={f.name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set({ fonts: { heading: f.heading, body: f.body } })}
                  className={`rounded-xl border p-2.5 text-left ${active ? 'border-ink bg-sunken' : 'border-line hover:bg-sunken'}`}
                >
                  <span className="block text-sm font-bold">{f.name}</span>
                  <span className="block truncate text-[11px] text-muted">
                    {FONTS.find((x) => x.key === f.heading)?.name} + {FONTS.find((x) => x.key === f.body)?.name}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>
        <Section title="Atur sendiri">
          <div className="grid gap-3 sm:grid-cols-2">
            {(['heading', 'body'] as const).map((k) => (
              <Field key={k} label={k === 'heading' ? 'Judul & angka besar' : 'Isi'} htmlFor={`f-${k}`}>
                <Select id={`f-${k}`} value={tpl.fonts[k]} onChange={(e) => set({ fonts: { ...tpl.fonts, [k]: e.target.value as FontKey } })}>
                  {(['sans', 'serif', 'mono'] as const).map((kind) => (
                    <optgroup key={kind} label={kind === 'sans' ? 'Sans' : kind === 'serif' ? 'Serif' : 'Monospace'}>
                      {FONTS.filter((f) => f.kind === kind).map((f) => (
                        <option key={f.key} value={f.key}>
                          {f.name}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </Select>
              </Field>
            ))}
            <Field label={`Ukuran huruf ${Math.round(tpl.style.fontScale * 100)}%`} htmlFor="f-scale">
              <input
                id="f-scale"
                type="range"
                min={0.85}
                max={1.2}
                step={0.05}
                value={tpl.style.fontScale}
                onChange={(e) => setStyle('fontScale', Number(e.target.value))}
                className="h-11 w-full accent-[var(--clay)]"
              />
            </Field>
            <Field label="Huruf judul">
              <Segmented
                label="Huruf judul"
                value={tpl.style.titleCase}
                onChange={(v) => setStyle('titleCase', v)}
                options={[
                  { value: 'normal', label: 'Seperti diketik' },
                  { value: 'upper', label: 'KAPITAL' },
                ]}
              />
            </Field>
          </div>
        </Section>
      </>
    ),

    konten: (
      <>
        <Section title="Kepala dokumen">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Judul (Indonesia)" htmlFor="t-id">
              <TextInput id="t-id" value={tpl.titles.id} onChange={(e) => set({ titles: { ...tpl.titles, id: e.target.value } })} />
            </Field>
            <Field label="Judul (English)" htmlFor="t-en">
              <TextInput id="t-en" value={tpl.titles.en} onChange={(e) => set({ titles: { ...tpl.titles, en: e.target.value } })} />
            </Field>
            <Field label="Tagline usaha" htmlFor="t-tag" hint="Tampil kecil di bawah nama usaha" className="sm:col-span-2">
              <TextInput id="t-tag" value={tpl.tagline} placeholder="Contoh: Jasa desain & percetakan sejak 2015" onChange={(e) => set({ tagline: e.target.value })} />
            </Field>
            <Field label="Posisi logo" hint={layoutMeta?.logoAlign ? undefined : `Layout ${layoutMeta?.name} memakai posisi logo sendiri`}>
              <Segmented
                label="Posisi logo"
                value={tpl.logo.align}
                onChange={(v) => set({ logo: { ...tpl.logo, align: v } })}
                options={[
                  { value: 'left', label: 'Kiri' },
                  { value: 'center', label: 'Tengah' },
                  { value: 'right', label: 'Kanan' },
                ]}
              />
            </Field>
            <Field label="Ukuran logo">
              <Segmented
                label="Ukuran logo"
                value={tpl.logo.size}
                onChange={(v) => set({ logo: { ...tpl.logo, size: v } })}
                options={[
                  { value: 's', label: 'S' },
                  { value: 'm', label: 'M' },
                  { value: 'l', label: 'L' },
                  { value: 'xl', label: 'XL' },
                ]}
              />
            </Field>
          </div>
          {!settings.business.logo && (
            <p className="mt-3 text-xs text-muted">
              Logo belum diunggah.{' '}
              <Link to="/pengaturan" className="font-semibold text-clay underline">
                Unggah di Pengaturan
              </Link>
            </p>
          )}
        </Section>
        {SHOW_GROUPS.map((g) => (
          <Section key={g.title} title={g.title}>
            <div className="divide-y divide-line">
              {g.items.map(([k, label, hint]) => (
                <Toggle key={k} label={label} hint={hint} checked={tpl.show[k]} onChange={(v) => set({ show: { ...tpl.show, [k]: v } })} />
              ))}
            </div>
          </Section>
        ))}
        <Section title="Kaki halaman">
          <TextInput aria-label="Teks kaki halaman" value={tpl.footer} placeholder="Contoh: Terima kasih atas kerja samanya" onChange={(e) => set({ footer: e.target.value })} />
        </Section>
      </>
    ),

    label: (
      <Section
        title="Ganti label"
        hint="Ubah tulisan bawaan di dokumen, misalnya 'Deskripsi' jadi 'Layanan'. Kosongkan untuk pakai bawaan."
        action={
          <div className="w-40 shrink-0">
            <Segmented
              label="Bahasa label"
              value={labelLang}
              onChange={setLabelLang}
              options={[
                { value: 'id', label: 'ID' },
                { value: 'en', label: 'EN' },
              ]}
            />
          </div>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {LABEL_FIELDS.map((f) => (
            <Field key={f.key} label={f.name} htmlFor={`l-${f.key}`}>
              <TextInput
                id={`l-${f.key}`}
                value={tpl.labels[labelLang][f.key] ?? ''}
                placeholder={docLabels(labelLang)[f.key]}
                onChange={(e) => set({ labels: { ...tpl.labels, [labelLang]: { ...tpl.labels[labelLang], [f.key]: e.target.value } } })}
              />
            </Field>
          ))}
        </div>
        {Object.values(tpl.labels[labelLang]).some(Boolean) && (
          <Button size="sm" variant="ghost" className="mt-3" onClick={() => set({ labels: { ...tpl.labels, [labelLang]: {} } })}>
            Kembalikan semua label {labelLang.toUpperCase()} ke bawaan
          </Button>
        )}
      </Section>
    ),

    kertas: (
      <Section title="Kertas & tata letak">
        <div className="flex flex-col gap-4">
          <Field label="Ukuran kertas">
            <Chips label="Ukuran kertas" value={tpl.paper} onChange={(v) => set({ paper: v })} options={PAPERS.map((p) => ({ value: p.key, label: p.name }))} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Margin">
              <Segmented
                label="Margin"
                value={tpl.style.margin}
                onChange={(v) => setStyle('margin', v)}
                options={[
                  { value: 'narrow', label: 'Sempit' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'wide', label: 'Lebar' },
                ]}
              />
            </Field>
            <Field label="Kepadatan" hint="Padat muat lebih banyak item per halaman">
              <Segmented
                label="Kepadatan"
                value={tpl.density}
                onChange={(v) => set({ density: v })}
                options={[
                  { value: 'normal', label: 'Lega' },
                  { value: 'compact', label: 'Padat' },
                ]}
              />
            </Field>
          </div>
        </div>
      </Section>
    ),
  };

  const previewControls = (
    <div className="mb-2 flex flex-wrap items-center gap-1.5">
      <Chips
        label="Bahasa preview"
        value={pv.lang}
        onChange={(lang) => setPv({ ...pv, lang })}
        options={[
          { value: 'id', label: 'ID' },
          { value: 'en', label: 'EN' },
        ]}
      />
      <Chips
        label="Jumlah item preview"
        value={pv.long ? 'long' : 'short'}
        onChange={(v) => setPv({ ...pv, long: v === 'long' })}
        options={[
          { value: 'short', label: '3 item' },
          { value: 'long', label: '15 item' },
        ]}
      />
      <Chips
        label="Status preview"
        value={pv.paid ? 'paid' : 'sent'}
        onChange={(v) => setPv({ ...pv, paid: v === 'paid' })}
        options={[
          { value: 'sent', label: 'Belum bayar' },
          { value: 'paid', label: 'Lunas' },
        ]}
      />
    </div>
  );

  const isDefault = settings.defaults.templateId === tpl.id;

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-8">
      <div className="min-w-0">
        <PageHeader
          back="/template"
          title={tpl.name || 'Tanpa nama'}
          sub={saved ? 'Tersimpan otomatis' : 'Menyimpan...'}
          actions={
            <div className="flex items-center gap-1.5">
              <Button size="sm" variant="ghost" onClick={undo} disabled={!past.current.length} title="Urungkan (Ctrl+Z)">
                Urungkan
              </Button>
              <Button size="sm" variant="ghost" onClick={redo} disabled={!future.current.length} title="Ulangi (Ctrl+Shift+Z)">
                Ulangi
              </Button>
            </div>
          }
        />

        <Card className="mb-3">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field label="Nama template" htmlFor="tname">
              <TextInput id="tname" value={tpl.name} onChange={(e) => set({ name: e.target.value })} />
            </Field>
            <div className="flex flex-wrap gap-2">
              {base && (
                <Button
                  onClick={() => set({ ...structuredClone(base), id: tpl.id, name: tpl.name, builtin: false, baseId: base.id, createdAt: tpl.createdAt })}
                  title={`Kembalikan semua pengaturan ke ${base.name}`}
                >
                  Reset ke {base.name}
                </Button>
              )}
              <Button
                variant={isDefault ? 'secondary' : 'primary'}
                disabled={isDefault}
                onClick={async () => {
                  await updateSettings((s) => ({ ...s, defaults: { ...s.defaults, templateId: tpl.id } }));
                  toast('Jadi template default untuk invoice baru');
                }}
              >
                {isDefault ? 'Template default' : 'Jadikan default'}
              </Button>
            </div>
          </div>
        </Card>

        {!wide && (
          <div className="mb-3">
            <Segmented
              label="Tampilan"
              value={mobileView}
              onChange={setMobileView}
              options={[
                { value: 'edit', label: 'Atur' },
                { value: 'preview', label: 'Preview' },
              ]}
            />
          </div>
        )}

        {wide || mobileView === 'edit' ? (
          <>
            <div role="tablist" aria-label="Bagian pengaturan" className="no-scrollbar sticky top-0 z-10 -mx-4 mb-3 flex gap-1 overflow-x-auto border-b border-line bg-bg/95 px-4 backdrop-blur-sm md:mx-0 md:px-0">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.value}
                  onClick={() => setTab(t.value)}
                  className={`border-b-2 px-3.5 py-2.5 text-sm font-bold whitespace-nowrap transition-colors ${tab === t.value ? 'border-clay text-clay' : 'border-transparent text-muted hover:text-text'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3 pb-6">{panels[tab]}</div>
          </>
        ) : (
          <>
            {previewControls}
            <PdfPreview blob={pdf.blob} busy={pdf.busy} error={pdf.error} />
          </>
        )}
      </div>
      {wide && (
        <aside className="sticky top-20 max-h-[calc(100dvh-6rem)] self-start overflow-y-auto pb-6" aria-label="Preview template">
          {previewControls}
          <PdfPreview blob={pdf.blob} busy={pdf.busy} error={pdf.error} />
        </aside>
      )}
    </div>
  );
}
