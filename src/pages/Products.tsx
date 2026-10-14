import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getSettings } from '../db';
import { useSettings } from '../hooks';
import { displayDecimals, formatMoney } from '../lib/money';
import { uid } from '../lib/id';
import type { Product } from '../types';
import { PageHeader } from '../components/layout';
import { Button, EmptyState, Field, Loading, NumberInput, Sheet, TextArea, TextInput, useUI } from '../components/ui';
import { IconPlus, IconSearch } from '../components/icons';

const blank = (): Product => ({ id: '', name: '', detail: '', unit: '', price: 0, createdAt: 0, updatedAt: 0 });

export function Products() {
  const { toast, confirm } = useUI();
  const settings = useSettings();
  const products = useLiveQuery(() => db.products.orderBy('name').toArray(), []);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const currency = settings?.defaults.currency ?? 'IDR';
  const lang = settings?.defaults.lang ?? 'id';

  const visible = (products ?? []).filter((p) => !q || `${p.name} ${p.detail}`.toLowerCase().includes(q.toLowerCase()));

  const save = async () => {
    if (!editing || !editing.name.trim()) return;
    const name = editing.name.trim();
    const twin = await db.products.where('name').equalsIgnoreCase(name).first();
    if (twin && twin.id !== editing.id) {
      toast(`"${twin.name}" sudah ada di katalog.`, 'error');
      return;
    }
    const now = Date.now();
    await db.products.put({ ...editing, name, id: editing.id || uid(), createdAt: editing.createdAt || now, updatedAt: now });
    toast(editing.id ? 'Item diperbarui' : 'Item ditambahkan');
    setEditing(null);
  };

  const remove = async (p: Product) => {
    const ok = await confirm({ title: `Hapus ${p.name}?`, message: 'Invoice yang sudah memakai item ini tidak berubah.', confirmLabel: 'Hapus', danger: true });
    if (!ok) return;
    await db.products.delete(p.id);
    setEditing(null);
    toast('Item dihapus');
  };

  // Seeds the catalog from past invoices; the most recent price of each description wins.
  const importHistory = async () => {
    const s = await getSettings();
    const existing = new Set((await db.products.toArray()).map((p) => p.name.trim().toLowerCase()));
    const found = new Map<string, Product>();
    const now = Date.now();
    const invoices = await db.invoices.orderBy('updatedAt').toArray();
    for (const inv of invoices) {
      if (inv.currency !== s.defaults.currency) continue;
      for (const it of inv.items) {
        const name = it.description.trim();
        if (!name || !it.price || existing.has(name.toLowerCase())) continue;
        found.set(name.toLowerCase(), { id: uid(), name, detail: it.detail, unit: it.unit, price: it.price, createdAt: now, updatedAt: now });
      }
    }
    if (found.size === 0) {
      toast('Tidak ada item baru dari riwayat invoice.');
      return;
    }
    await db.products.bulkPut([...found.values()]);
    toast(`${found.size} item ditambahkan dari riwayat invoice`);
  };

  return (
    <>
      <PageHeader
        back="/pengaturan"
        title="Katalog produk & jasa"
        sub="Ketik nama item di invoice, harga dan satuan terisi sendiri"
        actions={
          <Button variant="primary" onClick={() => setEditing(blank())}>
            <IconPlus size={18} /> Tambah
          </Button>
        }
      />

      {products === undefined ? (
        <Loading />
      ) : products.length === 0 ? (
        <EmptyState
          title="Katalog masih kosong"
          body="Tambahkan item yang sering kamu tagih, atau ambil otomatis dari invoice yang sudah pernah dibuat."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="primary" onClick={() => setEditing(blank())}>
                <IconPlus size={18} /> Tambah item
              </Button>
              <Button onClick={importHistory}>Ambil dari riwayat invoice</Button>
            </div>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <IconSearch size={18} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
              <TextInput type="search" aria-label="Cari item" placeholder="Cari item..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-10 text-sm" />
            </div>
            <Button onClick={importHistory}>Ambil dari riwayat invoice</Button>
          </div>
          {visible.length === 0 ? (
            <EmptyState title="Item tidak ditemukan" body={`Tidak ada item yang cocok dengan "${q}".`} action={<Button onClick={() => setQ('')}>Hapus pencarian</Button>} />
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
              {visible.map((p) => (
                <li key={p.id}>
                  <button type="button" onClick={() => setEditing(p)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-sunken">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{p.name}</span>
                      {p.detail && <span className="block truncate text-xs text-muted">{p.detail}</span>}
                    </span>
                    <span className="num shrink-0 text-right text-sm font-bold">
                      {formatMoney(p.price, currency, lang)}
                      {p.unit && <span className="block text-xs font-normal text-muted">per {p.unit}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Sheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit item' : 'Item baru'}
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <div>
              {editing?.id && (
                <Button variant="danger" onClick={() => editing && remove(editing)}>
                  Hapus
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2.5">
              <Button onClick={() => setEditing(null)}>Batal</Button>
              <Button variant="primary" onClick={save} disabled={!editing?.name.trim()} className="min-w-28">
                Simpan
              </Button>
            </div>
          </div>
        }
      >
        {editing && (
          <div className="flex flex-col gap-3">
            <Field label="Nama item" htmlFor="p-name">
              <TextInput id="p-name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label="Keterangan" htmlFor="p-detail" hint="Opsional, ikut terisi di baris invoice">
              <TextArea id="p-detail" rows={2} value={editing.detail} onChange={(e) => setEditing({ ...editing, detail: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={`Harga (${currency})`}>
                <NumberInput aria-label="Harga" lang={lang} decimals={displayDecimals(currency)} value={editing.price} onChange={(v) => setEditing({ ...editing, price: v })} />
              </Field>
              <Field label="Satuan" htmlFor="p-unit">
                <TextInput id="p-unit" placeholder="jam, pcs, paket" value={editing.unit} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} />
              </Field>
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}
