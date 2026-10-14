import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, deriveStatus } from '../db';
import { useSettings } from '../hooks';
import { computeTotals, formatMoney } from '../lib/money';
import { todayISO } from '../lib/id';
import { downloadFile } from '../lib/files';
import { STATUS_META, PageHeader } from '../components/layout';
import { Button, Card, EmptyState, Field, Loading, Select } from '../components/ui';
import { IconDownload } from '../components/icons';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function csvCell(v: string | number) {
  const s = String(v ?? '');
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function Reports() {
  const settings = useSettings();
  const invoices = useLiveQuery(() => db.invoices.toArray(), []);
  const today = todayISO();
  const [year, setYear] = useState(today.slice(0, 4));
  const [picked, setPicked] = useState<string>();
  const currency = picked ?? settings?.defaults.currency ?? 'IDR';

  const years = useMemo(() => {
    const set = new Set([today.slice(0, 4)]);
    for (const inv of invoices ?? []) {
      set.add(inv.issueDate.slice(0, 4));
      for (const p of inv.payments) set.add(p.date.slice(0, 4));
    }
    return [...set].sort().reverse();
  }, [invoices, today]);

  const currencies = useMemo(() => {
    const set = new Set([settings?.defaults.currency ?? 'IDR']);
    for (const inv of invoices ?? []) set.add(inv.currency);
    return [...set];
  }, [invoices, settings?.defaults.currency]);

  const report = useMemo(() => {
    const months = MONTHS.map(() => ({ billed: 0, received: 0, count: 0 }));
    const debtors = new Map<string, { name: string; clientId?: string; balance: number; overdue: number; count: number }>();
    for (const inv of invoices ?? []) {
      if (inv.currency !== currency || inv.status === 'void') continue;
      const status = deriveStatus(inv, today);
      const t = computeTotals(inv);
      if (inv.status !== 'draft' && inv.issueDate.startsWith(year)) {
        const m = months[Number(inv.issueDate.slice(5, 7)) - 1];
        m.billed += t.grandTotal;
        m.count += 1;
      }
      for (const p of inv.payments) if (p.date.startsWith(year)) months[Number(p.date.slice(5, 7)) - 1].received += p.amount;
      if (status === 'sent' || status === 'partial' || status === 'overdue') {
        const key = inv.clientId ?? inv.client.name.trim().toLowerCase();
        const d = debtors.get(key) ?? { name: inv.client.name || 'Tanpa nama', clientId: inv.clientId, balance: 0, overdue: 0, count: 0 };
        d.balance += t.balance;
        if (status === 'overdue') d.overdue += t.balance;
        d.count += 1;
        debtors.set(key, d);
      }
    }
    const total = months.reduce((a, m) => ({ billed: a.billed + m.billed, received: a.received + m.received, count: a.count + m.count }), { billed: 0, received: 0, count: 0 });
    return { months, total, debtors: [...debtors.values()].filter((d) => d.balance > 0).sort((a, b) => b.balance - a.balance) };
  }, [invoices, currency, year, today]);

  const exportCsv = () => {
    const head = ['Nomor', 'Tanggal', 'Jatuh tempo', 'Klien', 'NPWP klien', 'Referensi', 'Status', 'Mata uang', 'Subtotal', 'Diskon', 'DPP', 'PPN', 'PPh', 'Penyesuaian', 'Total', 'Dibayar', 'Sisa'];
    const rows = (invoices ?? [])
      .filter((inv) => inv.issueDate.startsWith(year))
      .sort((a, b) => a.issueDate.localeCompare(b.issueDate) || a.number.localeCompare(b.number))
      .map((inv) => {
        const t = computeTotals(inv);
        return [inv.number, inv.issueDate, inv.dueDate, inv.client.name, inv.client.taxId, inv.reference, STATUS_META[deriveStatus(inv, today)].label, inv.currency, t.subtotal, t.discount, t.taxBase, t.tax, t.pph, t.adjustments, t.grandTotal, t.paid, t.balance];
      });
    const csv = [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
    // The BOM makes Excel open the file as UTF-8 instead of mangling client names.
    downloadFile(new File(['﻿' + csv], `invoice-${year}.csv`, { type: 'text/csv' }));
  };

  if (!invoices || !settings) return <Loading />;

  const money = (v: number) => formatMoney(v, currency);

  return (
    <>
      <PageHeader
        title="Laporan"
        sub="Ringkasan tagihan, penerimaan, dan piutang"
        actions={
          <Button onClick={exportCsv} disabled={invoices.length === 0}>
            <IconDownload size={18} /> Ekspor CSV {year}
          </Button>
        }
      />

      {invoices.length === 0 ? (
        <EmptyState title="Belum ada data" body="Laporan muncul setelah ada invoice yang dibuat." />
      ) : (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 sm:max-w-md">
            <Field label="Tahun" htmlFor="r-year">
              <Select id="r-year" value={year} onChange={(e) => setYear(e.target.value)}>
                {years.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </Select>
            </Field>
            <Field label="Mata uang" htmlFor="r-cur">
              <Select id="r-cur" value={currency} onChange={(e) => setPicked(e.target.value)}>
                {currencies.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
          </div>

          <Card className="p-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2 px-4 pt-4">
              <h2 className="text-[15px] font-bold">Per bulan, {year}</h2>
              <p className="text-xs text-muted">Ditagih dihitung dari tanggal invoice terkirim, diterima dari tanggal pembayaran.</p>
            </div>
            <div className="custom-scrollbar mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-sm">
                <thead>
                  <tr className="border-y border-line bg-sunken/60 text-left text-xs font-bold tracking-wider text-muted uppercase">
                    <th className="px-4 py-2.5">Bulan</th>
                    <th className="px-4 py-2.5 text-right">Invoice</th>
                    <th className="px-4 py-2.5 text-right">Ditagih</th>
                    <th className="px-4 py-2.5 text-right">Diterima</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {report.months.map((m, i) => (
                    <tr key={i} className={m.count || m.received ? '' : 'text-muted'}>
                      <td className="px-4 py-2.5">{MONTHS[i]}</td>
                      <td className="num px-4 py-2.5 text-right">{m.count || '-'}</td>
                      <td className="num px-4 py-2.5 text-right">{m.billed ? money(m.billed) : '-'}</td>
                      <td className="num px-4 py-2.5 text-right">{m.received ? money(m.received) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-line font-bold">
                    <td className="px-4 py-3">Total</td>
                    <td className="num px-4 py-3 text-right">{report.total.count}</td>
                    <td className="num px-4 py-3 text-right">{money(report.total.billed)}</td>
                    <td className="num px-4 py-3 text-right text-ok">{money(report.total.received)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          <Card>
            <h2 className="mb-1 text-[15px] font-bold">Piutang per klien</h2>
            <p className="mb-3 text-xs text-muted">Semua invoice yang belum lunas sampai hari ini, dalam {currency}.</p>
            {report.debtors.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted">Tidak ada piutang. Semua sudah lunas.</p>
            ) : (
              <ul className="divide-y divide-line">
                {report.debtors.map((d) => (
                  <li key={d.clientId ?? d.name} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      {d.clientId ? (
                        <Link to={`/?klien=${d.clientId}`} className="block truncate font-semibold hover:text-clay hover:underline">
                          {d.name}
                        </Link>
                      ) : (
                        <p className="truncate font-semibold">{d.name}</p>
                      )}
                      <p className="text-xs text-muted">{d.count} invoice</p>
                    </div>
                    <div className="num shrink-0 text-right">
                      <p className="font-bold">{money(d.balance)}</p>
                      {d.overdue > 0 && <p className="text-xs font-semibold text-danger">{money(d.overdue)} lewat tempo</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
