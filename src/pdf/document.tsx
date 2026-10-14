import { Buffer } from 'buffer';
import { Document, Image, Page, Text, View, pdf } from '@react-pdf/renderer';
import type { Invoice, LayoutKey, Payment, Settings, Status, TemplateConfig } from '../types';
import { buildCtx, hexAlpha, type DocCtx } from './context';
import { registerFonts } from './fonts';
import { Anggun, Arsip, Garis, Pita, Samping, Struk, Tegas } from './layouts';
import { Bingkai, Geometri, Kartu, Kop, Korporat, Lengkung, Studio } from './layouts2';
import { Label, Logo, BusinessName, BusinessDetails } from './parts';
import { terbilang } from '../lib/terbilang';
import { formatDate } from '../lib/labels';

// react-pdf checks Buffer.isBuffer after loading images and logs a warning per image when it's missing.
(globalThis as { Buffer?: unknown }).Buffer ??= Buffer;

const LAYOUT_COMPONENTS: Record<LayoutKey, ({ ctx }: { ctx: DocCtx }) => React.JSX.Element> = {
  arsip: Arsip,
  pita: Pita,
  garis: Garis,
  tegas: Tegas,
  anggun: Anggun,
  samping: Samping,
  struk: Struk,
  kop: Kop,
  korporat: Korporat,
  kartu: Kartu,
  bingkai: Bingkai,
  studio: Studio,
  lengkung: Lengkung,
  geometri: Geometri,
};

export function InvoiceDocument({ ctx }: { ctx: DocCtx }) {
  const Layout = LAYOUT_COMPONENTS[ctx.tpl.layout] ?? Arsip;
  return (
    <Document title={`${ctx.title} ${ctx.inv.number}`} author={ctx.s.business.name || undefined} creator="Invoice Maker" producer="Invoice Maker">
      <Layout ctx={ctx} />
    </Document>
  );
}

function ReceiptDocument({ ctx, payment }: { ctx: DocCtx; payment: Payment }) {
  const { L, c, fz } = ctx;
  const words = terbilang(payment.amount, ctx.inv.currency, ctx.inv.lang);
  const purpose = ctx.inv.items.map((i) => i.description).filter(Boolean).join(', ') || ctx.title;
  const row = (k: string, v: string, bold = false) => (
    <View style={{ flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 0.6, borderBottomColor: hexAlpha(c.text, 0.15) }}>
      <Text style={{ width: 130, color: c.muted, fontSize: fz.base }}>{k}</Text>
      <Text style={{ flex: 1, fontSize: fz.base, fontWeight: bold ? 700 : 400, lineHeight: 1.4 }}>{v}</Text>
    </View>
  );
  const sig = ctx.s.signature;
  return (
    <Document title={`${L.receipt} ${payment.receiptNumber ?? ''}`} creator="Invoice Maker" producer="Invoice Maker">
      <Page size="A5" orientation="landscape" style={{ fontFamily: ctx.body, color: c.text, backgroundColor: c.paper, padding: 30 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 2, borderBottomColor: c.primary, paddingBottom: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', maxWidth: '60%' }}>
            <Logo ctx={ctx} height={34} />
            <View>
              <BusinessName ctx={ctx} />
              <BusinessDetails ctx={ctx} />
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: ctx.head, fontWeight: 700, fontSize: fz.xl + 2, color: c.primary, letterSpacing: 1.5 }}>{L.receipt}</Text>
            <Text style={{ fontSize: fz.base, color: c.accent, fontWeight: 700, marginTop: 2 }}>{payment.receiptNumber}</Text>
          </View>
        </View>
        <View style={{ marginTop: 10 }}>
          {row(L.receivedFrom, ctx.inv.client.name || '-', true)}
          {row(L.amountOf, words)}
          {row(L.forPayment, `${purpose} (${L.invoiceRef} ${ctx.inv.number})${payment.note ? `. ${payment.note}` : ''}`)}
          {payment.method ? row(L.method, payment.method) : null}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 16 }}>
          <View style={{ backgroundColor: hexAlpha(c.primary, 0.08), borderRadius: 4, paddingVertical: 8, paddingHorizontal: 14 }}>
            <Label ctx={ctx}>{L.amount}</Label>
            <Text style={{ fontFamily: ctx.head, fontWeight: 700, fontSize: fz.xl + 2 }}>{ctx.money(payment.amount)}</Text>
          </View>
          <View style={{ width: 160, alignItems: 'center' }}>
            <Text style={{ fontSize: fz.sm, color: c.muted }}>{formatDate(payment.date, ctx.inv.lang)}</Text>
            <Text style={{ fontSize: fz.sm, color: c.muted }}>{L.receiver}</Text>
            <View style={{ height: 56, width: 160, alignItems: 'center', justifyContent: 'center' }}>
              {ctx.s.stamp && ctx.tpl.show.stamp ? <Image src={ctx.s.stamp} style={{ position: 'absolute', height: 56, width: 56, left: 30, objectFit: 'contain', opacity: 0.85 }} /> : null}
              {sig.image ? <Image src={sig.image} style={{ height: 48, objectFit: 'contain' }} /> : null}
            </View>
            <Text style={{ fontSize: fz.base, fontWeight: 700, borderTopWidth: 0.6, borderTopColor: hexAlpha(c.text, 0.4), paddingTop: 3, width: 160, textAlign: 'center' }}>
              {sig.name || ctx.s.business.name || ' '}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(inv: Invoice, tpl: TemplateConfig, s: Settings, status: Status): Promise<Blob> {
  registerFonts();
  const ctx = buildCtx(inv, tpl, s, status);
  return pdf(<InvoiceDocument ctx={ctx} />).toBlob();
}

export async function renderReceiptPdf(inv: Invoice, payment: Payment, tpl: TemplateConfig, s: Settings): Promise<Blob> {
  registerFonts();
  const ctx = buildCtx(inv, tpl, s, 'paid');
  return pdf(<ReceiptDocument ctx={ctx} payment={payment} />).toBlob();
}
