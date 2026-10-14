import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, updateSettings } from '../db';
import { useAllTemplates, useSettings } from '../hooks';
import { uid } from '../lib/id';
import { safeFileName, shareOrDownload } from '../lib/files';
import { BUILTIN_TEMPLATES, CATEGORIES, LAYOUTS, normalizeTemplate, type LayoutCategory } from '../templates';
import type { TemplateConfig } from '../types';
import { PageHeader } from '../components/layout';
import { Button, Loading, Sheet, useUI } from '../components/ui';
import { IconPlus, IconUpload } from '../components/icons';
import { TemplateThumb } from '../components/TemplateThumb';

export async function copyTemplate(src: TemplateConfig, name?: string): Promise<TemplateConfig> {
  const now = Date.now();
  const t: TemplateConfig = {
    ...normalizeTemplate(structuredClone(src)),
    id: uid(),
    name: name ?? `${src.name} (salinan)`,
    builtin: false,
    baseId: src.builtin ? src.id : src.baseId,
    createdAt: now,
    updatedAt: now,
  };
  await db.templates.put(t);
  return t;
}

export function Templates() {
  const navigate = useNavigate();
  const { toast, confirm } = useUI();
  const settings = useSettings();
  const templates = useAllTemplates();
  const [selected, setSelected] = useState<TemplateConfig | null>(null);
  const [category, setCategory] = useState<LayoutCategory | 'all'>('all');
  const importId = useId();

  if (!templates || !settings) return <Loading />;
  const custom = templates.filter((t) => !t.builtin);
  const defaultId = settings.defaults.templateId;

  const importFile = async (f: File) => {
    try {
      const data = JSON.parse(await f.text()) as Partial<TemplateConfig>;
      if (!data.layout || !LAYOUTS.some((l) => l.key === data.layout) || !data.colors || !data.fonts) throw new Error('File ini bukan template Invoice Maker.');
      const base = BUILTIN_TEMPLATES[0];
      const t = await copyTemplate(
        normalizeTemplate({ ...base, ...data, builtin: false, baseId: undefined, show: { ...base.show, ...data.show }, titles: { ...base.titles, ...data.titles } } as TemplateConfig),
        data.name ?? 'Template impor',
      );
      toast(`Template "${t.name}" ditambahkan`);
    } catch (e) {
      toast(e instanceof SyntaxError ? 'File bukan JSON yang valid.' : (e as Error).message, 'error');
    }
  };

  const Grid = ({ items }: { items: TemplateConfig[] }) => (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((t) => (
        <li key={t.id}>
          <button type="button" onClick={() => setSelected(t)} className="group block w-full text-left">
            <div className={`rounded-lg p-1 ${t.id === defaultId ? 'ring-2 ring-clay' : 'ring-1 ring-transparent group-hover:ring-line'}`}>
              <TemplateThumb tpl={t} settings={settings} alt={`Preview template ${t.name}`} />
            </div>
            <p className="mt-1.5 truncate px-1 text-sm font-bold">{t.name}</p>
            <p className="truncate px-1 text-xs text-muted">{t.id === defaultId ? 'Dipakai sebagai default' : LAYOUTS.find((l) => l.key === t.layout)?.name}</p>
          </button>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      <PageHeader
        title="Template"
        actions={
          <Button
            variant="primary"
            onClick={async () => {
              const base = templates.find((t) => t.id === defaultId) ?? BUILTIN_TEMPLATES[0];
              const t = await copyTemplate(base, 'Template baru');
              navigate(`/template/${t.id}`);
            }}
          >
            <IconPlus size={18} /> <span className="hidden sm:inline">Buat template</span>
            <span className="sm:hidden">Buat</span>
          </Button>
        }
      />
      <p className="-mt-2 mb-5 text-sm text-muted">Ketuk template untuk menjadikannya default atau membuat versimu sendiri. Logo, rekening, dan tanda tangan diambil dari Pengaturan.</p>

      {custom.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-[15px] font-bold">Buatanmu</h2>
          <Grid items={custom} />
        </section>
      )}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[15px] font-bold">Bawaan</h2>
          <div role="radiogroup" aria-label="Kategori template" className="flex flex-wrap gap-1.5">
            {[{ key: 'all' as const, name: 'Semua' }, ...CATEGORIES].map((c) => (
              <button
                key={c.key}
                type="button"
                role="radio"
                aria-checked={category === c.key}
                onClick={() => setCategory(c.key)}
                className={`min-h-9 rounded-full border px-3.5 text-xs font-bold transition-colors ${category === c.key ? 'border-ink bg-ink text-bg' : 'border-line bg-surface text-muted hover:text-text'}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <Grid items={templates.filter((t) => t.builtin && (category === 'all' || LAYOUTS.find((l) => l.key === t.layout)?.category === category))} />
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-2 border-t border-line pt-4">
        <label htmlFor={importId} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold hover:bg-sunken focus-within:outline-2 focus-within:outline-[var(--focus)]">
          <IconUpload size={18} /> Impor template (.json)
          <input
            id={importId}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) importFile(f);
              e.target.value = '';
            }}
          />
        </label>
      </div>

      <Sheet open={!!selected} onClose={() => setSelected(null)} title={selected?.name ?? ''}>
        {selected && (
          <div className="flex flex-col gap-2">
            <div className="mx-auto mb-2 w-48">
              <TemplateThumb tpl={selected} settings={settings} alt={`Preview template ${selected.name}`} />
            </div>
            <p className="mb-2 text-center text-sm text-muted">{LAYOUTS.find((l) => l.key === selected.layout)?.hint}</p>
            {selected.id !== defaultId && (
              <Button
                variant="primary"
                size="lg"
                onClick={async () => {
                  await updateSettings((s) => ({ ...s, defaults: { ...s.defaults, templateId: selected.id } }));
                  toast(`${selected.name} jadi template default untuk invoice baru`);
                  setSelected(null);
                }}
              >
                Jadikan default
              </Button>
            )}
            {selected.builtin ? (
              <Button
                size="lg"
                onClick={async () => {
                  const t = await copyTemplate(selected);
                  navigate(`/template/${t.id}`);
                }}
              >
                Buat versiku dari template ini
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => navigate(`/template/${selected.id}`)}>
                  Ubah template
                </Button>
                <Button
                  onClick={async () => {
                    const t = await copyTemplate(selected);
                    toast(`Disalin jadi "${t.name}"`);
                    setSelected(null);
                  }}
                >
                  Duplikat
                </Button>
                <Button
                  onClick={async () => {
                    const { id: _id, builtin: _b, createdAt: _c, updatedAt: _u, ...rest } = selected;
                    await shareOrDownload(new File([JSON.stringify(rest, null, 2)], `template-${safeFileName(selected.name)}.json`, { type: 'application/json' }));
                  }}
                >
                  Ekspor untuk perangkat lain
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    const used = await db.invoices.where('templateId').equals(selected.id).count();
                    const ok = await confirm({
                      title: `Hapus template "${selected.name}"?`,
                      message: used ? `${used} invoice memakai template ini dan akan beralih ke template Arsip.` : 'Template akan dihapus.',
                      confirmLabel: 'Hapus',
                      danger: true,
                    });
                    if (!ok) return;
                    await db.templates.delete(selected.id);
                    if (defaultId === selected.id) await updateSettings((s) => ({ ...s, defaults: { ...s.defaults, templateId: BUILTIN_TEMPLATES[0].id } }));
                    setSelected(null);
                    toast('Template dihapus');
                  }}
                >
                  Hapus
                </Button>
              </>
            )}
          </div>
        )}
      </Sheet>
    </>
  );
}
