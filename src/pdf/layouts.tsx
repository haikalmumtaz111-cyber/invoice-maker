import { Page, Text, View } from '@react-pdf/renderer';
import type { DocCtx } from './context';
import { hexAlpha, readableOn } from './context';
import {
  BottomSection,
  BusinessDetails,
  BusinessName,
  ClientBlock,
  ItemsTable,
  Label,
  Logo,
  MetaRows,
  NotesTerms,
  PageDecor,
  PageFooter,
  PaymentInfo,
  Signature,
  StatusStamp,
  Terbilang,
  TotalsBlock,
  totalRows,
} from './parts';
import { lineTotals } from '../lib/money';

export function pageStyle(ctx: DocCtx, extra: object = {}) {
  return {
    fontFamily: ctx.body,
    fontSize: ctx.fz.base,
    color: ctx.c.text,
    backgroundColor: ctx.c.paper,
    paddingHorizontal: ctx.pad,
    paddingTop: ctx.pad,
    paddingBottom: ctx.pad + 16,
    ...extra,
  };
}

export function SenderBlock({ ctx, align = 'left' }: { ctx: DocCtx; align?: 'left' | 'right' | 'center' }) {
  const items = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';
  return (
    <View style={{ alignItems: items }}>
      <Logo ctx={ctx} />
      <BusinessName ctx={ctx} style={{ marginTop: ctx.s.business.logo && ctx.tpl.show.logo ? 6 : 0, textAlign: align }} />
      <BusinessDetails ctx={ctx} align={align} />
    </View>
  );
}

export function TotalsArea({ ctx, highlight }: { ctx: DocCtx; highlight?: { bg: string; color?: string } }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: ctx.gap * 0.7, gap: 24 }}>
      <View style={{ flex: 1 }}>
        <Terbilang ctx={ctx} />
        <StatusStamp ctx={ctx} />
      </View>
      <TotalsBlock ctx={ctx} highlight={highlight} />
    </View>
  );
}

export function Arsip({ ctx }: { ctx: DocCtx }) {
  const align = ctx.tpl.logo.align;
  const logoRight = align === 'right';
  return (
    <Page size={ctx.size} style={pageStyle(ctx)}>
      <PageDecor ctx={ctx} />
      {align === 'center' ? (
        <View style={{ alignItems: 'center' }}>
          <SenderBlock ctx={ctx} align="center" />
          <Text style={{ fontFamily: ctx.head, fontWeight: 700, fontSize: ctx.fz.xl + 4, color: ctx.c.primary, letterSpacing: 1, marginTop: ctx.gap * 0.8 }}>{ctx.title}</Text>
          <Text style={{ fontSize: ctx.fz.base, color: ctx.c.accent, fontWeight: 700, marginTop: 2 }}>{ctx.inv.number}</Text>
        </View>
      ) : (
        <View style={{ flexDirection: logoRight ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ maxWidth: '55%' }}>
            <SenderBlock ctx={ctx} align={logoRight ? 'right' : 'left'} />
          </View>
          <View style={{ alignItems: logoRight ? 'flex-start' : 'flex-end' }}>
            <Text style={{ fontFamily: ctx.head, fontWeight: 700, fontSize: ctx.fz.xl + 4, color: ctx.c.primary, letterSpacing: 1 }}>{ctx.title}</Text>
            <Text style={{ fontSize: ctx.fz.base, color: ctx.c.accent, fontWeight: 700, marginTop: 2, marginBottom: 8 }}>{ctx.inv.number}</Text>
            <MetaRows ctx={ctx} withNumber={false} align={logoRight ? 'left' : 'right'} />
          </View>
        </View>
      )}
      <View style={{ height: 1, backgroundColor: ctx.c.primary, marginVertical: ctx.gap }} />
      {align === 'center' ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 20 }}>
          <View style={{ flex: 1 }}>
            <ClientBlock ctx={ctx} />
          </View>
          <MetaRows ctx={ctx} withNumber={false} />
        </View>
      ) : (
        <ClientBlock ctx={ctx} />
      )}
      <View style={{ marginTop: ctx.gap }}>
        <ItemsTable ctx={ctx} style={{ headBorder: ctx.c.primary, uppercase: true }} />
      </View>
      <TotalsArea ctx={ctx} />
      <BottomSection ctx={ctx} />
      <PageFooter ctx={ctx} />
    </Page>
  );
}

export function Pita({ ctx }: { ctx: DocCtx }) {
  const bg = ctx.c.primary;
  const fg = readableOn(bg);
  const soft = hexAlpha(fg === '#ffffff' ? '#ffffff' : '#000000', 0.75);
  return (
    <Page size={ctx.size} style={pageStyle(ctx, { paddingHorizontal: 0 })}>
      <PageDecor ctx={ctx} />
      {/* Page padding keeps continuation pages off the paper edge; the band cancels it on page one. */}
      <View style={{ backgroundColor: bg, marginTop: -ctx.pad, paddingHorizontal: ctx.pad, paddingTop: ctx.pad, paddingBottom: ctx.gap + 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ maxWidth: '58%' }}>
            {ctx.tpl.show.logo && ctx.s.business.logo ? (
              <View style={{ backgroundColor: '#ffffff', padding: 6, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 8 }}>
                <Logo ctx={ctx} />
              </View>
            ) : null}
            <BusinessName ctx={ctx} style={{ color: fg }} />
            <BusinessDetails ctx={ctx} color={soft} />
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontFamily: ctx.head, fontWeight: 700, fontSize: ctx.fz.xxl, color: fg }}>{ctx.title}</Text>
            <Text style={{ fontSize: ctx.fz.lg, color: fg, marginTop: 2 }}>{ctx.inv.number}</Text>
          </View>
        </View>
      </View>
      <View style={{ paddingHorizontal: ctx.pad }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: ctx.gap, gap: 20 }}>
          <View style={{ flex: 1 }}>
            <ClientBlock ctx={ctx} labelColor={ctx.c.primary} />
          </View>
          <MetaRows ctx={ctx} withNumber={false} />
        </View>
        <View style={{ marginTop: ctx.gap }}>
          <ItemsTable ctx={ctx} style={{ headBg: hexAlpha(bg, 0.1), headColor: bg, rowBorder: hexAlpha(bg, 0.15) }} />
        </View>
        <TotalsArea ctx={ctx} highlight={{ bg }} />
        <BottomSection ctx={ctx} labelColor={ctx.c.primary} />
      </View>
      <PageFooter ctx={ctx} />
    </Page>
  );
}

export function Garis({ ctx }: { ctx: DocCtx }) {
  return (
    <Page size={ctx.size} style={pageStyle(ctx)}>
      <PageDecor ctx={ctx} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Logo ctx={ctx} />
        <View style={{ alignItems: 'flex-end', maxWidth: '55%' }}>
          <BusinessName ctx={ctx} style={{ fontSize: ctx.fz.base, textAlign: 'right' }} />
          <BusinessDetails ctx={ctx} align="right" />
        </View>
      </View>
      <View style={{ marginTop: ctx.gap }}>
        <Text style={{ fontFamily: ctx.head, fontSize: ctx.fz.sm, color: ctx.c.muted, letterSpacing: 1 }}>{ctx.title}</Text>
        <Text style={{ fontFamily: ctx.head, fontSize: ctx.fz.xxl + 4, color: ctx.c.primary, marginTop: 2 }}>{ctx.inv.number}</Text>
        <View style={{ width: 36, height: 3, backgroundColor: ctx.c.accent, marginTop: 10 }} />
      </View>
      <View style={{ flexDirection: 'row', marginTop: ctx.gap, gap: 24 }}>
        <View style={{ flex: 1.4 }}>
          <ClientBlock ctx={ctx} />
        </View>
        <View style={{ flex: 1 }}>
          <MetaRows ctx={ctx} withNumber={false} align="left" />
        </View>
      </View>
      <View style={{ marginTop: ctx.gap }}>
        <ItemsTable ctx={ctx} style={{ headBorder: hexAlpha(ctx.c.text, 0.25) }} />
      </View>
      <TotalsArea ctx={ctx} />
      <BottomSection ctx={ctx} />
      <PageFooter ctx={ctx} />
    </Page>
  );
}

export function Tegas({ ctx }: { ctx: DocCtx }) {
  const block = ctx.c.primary;
  const fg = readableOn(block);
  return (
    <Page size={ctx.size} style={pageStyle(ctx)}>
      <PageDecor ctx={ctx} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Text style={{ fontFamily: ctx.head, fontWeight: 700, fontSize: ctx.fz.xxl * 1.5, color: ctx.c.primary, letterSpacing: -1, lineHeight: 1 }}>{ctx.title}</Text>
        <Logo ctx={ctx} />
      </View>
      <View style={{ flexDirection: 'row', marginTop: ctx.gap, gap: 18, borderTopWidth: 3, borderTopColor: ctx.c.accent, paddingTop: 10 }}>
        <View style={{ flex: 1 }}>
          <Label ctx={ctx}>{ctx.L.from}</Label>
          <BusinessName ctx={ctx} style={{ fontSize: ctx.fz.lg - 0.5 }} />
          <BusinessDetails ctx={ctx} />
        </View>
        <View style={{ flex: 1 }}>
          <ClientBlock ctx={ctx} />
        </View>
        <View style={{ width: 150 }}>
          <MetaRows ctx={ctx} align="left" />
        </View>
      </View>
      <View style={{ marginTop: ctx.gap, backgroundColor: block, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ color: fg, fontSize: ctx.fz.sm }}>{ctx.t.paid > 0 && ctx.t.balance > 0 ? ctx.L.balance : ctx.L.grandTotal}</Text>
          {ctx.inv.dueDate ? (
            <Text style={{ color: fg, fontSize: ctx.fz.sm, marginTop: 2 }}>
              {ctx.L.dueDate} {ctx.date(ctx.inv.dueDate)}
            </Text>
          ) : null}
        </View>
        <Text style={{ color: fg, fontFamily: ctx.head, fontWeight: 700, fontSize: ctx.fz.xxl }}>
          {ctx.money(ctx.t.paid > 0 && ctx.t.balance > 0 ? ctx.t.balance : ctx.t.grandTotal)}
        </Text>
      </View>
      <View style={{ marginTop: ctx.gap }}>
        <ItemsTable ctx={ctx} style={{ headBorder: ctx.c.primary, headColor: ctx.c.text, uppercase: true }} />
      </View>
      <TotalsArea ctx={ctx} />
      <BottomSection ctx={ctx} />
      <PageFooter ctx={ctx} />
    </Page>
  );
}

function DoubleRule({ color }: { color: string }) {
  return (
    <View>
      <View style={{ height: 0.8, backgroundColor: color }} />
      <View style={{ height: 0.4, backgroundColor: color, marginTop: 2 }} />
    </View>
  );
}

export function Anggun({ ctx }: { ctx: DocCtx }) {
  return (
    <Page size={ctx.size} style={pageStyle(ctx, { paddingTop: ctx.pad - 6 })}>
      <PageDecor ctx={ctx} />
      <View style={{ alignItems: 'center' }}>
        <Logo ctx={ctx} />
        <BusinessName ctx={ctx} style={{ fontSize: ctx.fz.xl, marginTop: 6, textAlign: 'center', letterSpacing: 0.5 }} />
        <BusinessDetails ctx={ctx} align="center" />
      </View>
      <View style={{ marginTop: ctx.gap * 0.7 }}>
        <DoubleRule color={ctx.c.accent} />
      </View>
      <View style={{ alignItems: 'center', marginVertical: ctx.gap * 0.6 }}>
        <Text style={{ fontFamily: ctx.head, fontSize: ctx.fz.xxl, color: ctx.c.primary, letterSpacing: 2 }}>{ctx.title}</Text>
        <Text style={{ fontSize: ctx.fz.base, color: ctx.c.accent, marginTop: 4, letterSpacing: 1 }}>{ctx.inv.number}</Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 20 }}>
        <View style={{ flex: 1 }}>
          <ClientBlock ctx={ctx} labelColor={ctx.c.accent} />
        </View>
        <MetaRows ctx={ctx} withNumber={false} labelColor={ctx.c.accent} />
      </View>
      <View style={{ marginTop: ctx.gap }}>
        <ItemsTable ctx={ctx} style={{ headBorder: ctx.c.accent, headColor: ctx.c.accent }} />
      </View>
      <TotalsArea ctx={ctx} />
      <BottomSection ctx={ctx} labelColor={ctx.c.accent} />
      <PageFooter ctx={ctx} />
    </Page>
  );
}

export function Samping({ ctx }: { ctx: DocCtx }) {
  const side = ctx.c.primary;
  const fg = readableOn(side);
  const soft = hexAlpha(fg === '#ffffff' ? '#ffffff' : '#000000', 0.72);
  const sideW = 170;
  return (
    <Page size={ctx.size} style={pageStyle(ctx, { paddingLeft: sideW + 28, paddingRight: ctx.pad })}>
      <PageDecor ctx={ctx} />
      <View fixed style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: sideW, backgroundColor: side }} />
      <View style={{ position: 'absolute', top: ctx.pad, left: 20, width: sideW - 40 }}>
        {ctx.tpl.show.logo && ctx.s.business.logo ? (
          <View style={{ backgroundColor: '#ffffff', padding: 6, borderRadius: 4, alignSelf: 'flex-start', marginBottom: 10 }}>
            <Logo ctx={ctx} height={36} />
          </View>
        ) : null}
        <BusinessName ctx={ctx} style={{ color: fg }} />
        <BusinessDetails ctx={ctx} color={soft} stacked />
        <View style={{ height: 2, width: 24, backgroundColor: ctx.c.accent, marginVertical: 16 }} />
        <PaymentInfo ctx={ctx} color={fg} labelColor={ctx.c.accent} stacked />
      </View>
      <Text style={{ fontFamily: ctx.head, fontWeight: 700, fontSize: ctx.fz.xxl, color: ctx.c.primary }}>{ctx.title}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: ctx.gap, gap: 16 }}>
        <View style={{ flex: 1 }}>
          <ClientBlock ctx={ctx} />
        </View>
        <MetaRows ctx={ctx} />
      </View>
      <View style={{ marginTop: ctx.gap }}>
        <ItemsTable ctx={ctx} style={{ headBorder: ctx.c.primary, uppercase: true }} />
      </View>
      <View style={{ marginTop: ctx.gap * 0.7, alignItems: 'flex-end' }}>
        <TotalsBlock ctx={ctx} highlight={{ bg: side }} />
      </View>
      <Terbilang ctx={ctx} />
      <StatusStamp ctx={ctx} mode="flow" />
      <View style={{ marginTop: ctx.gap, flexDirection: 'row', justifyContent: 'space-between', gap: 20 }}>
        <View style={{ flex: 1 }}>
          <NotesTerms ctx={ctx} />
        </View>
        <Signature ctx={ctx} />
      </View>
      <PageFooter ctx={ctx} left={sideW + 28} />
    </Page>
  );
}

function Dashed({ ctx }: { ctx: DocCtx }) {
  return <View style={{ borderBottomWidth: 1, borderBottomColor: ctx.c.muted, borderStyle: 'dashed', marginVertical: 8 }} />;
}

export function Struk({ ctx }: { ctx: DocCtx }) {
  const rows = totalRows(ctx);
  return (
    <Page size={ctx.size} style={pageStyle(ctx, { paddingHorizontal: ctx.pad + 60 })}>
      <PageDecor ctx={ctx} />
      <StatusStamp ctx={ctx} mode="page" />
      <View style={{ alignItems: 'center' }}>
        <Logo ctx={ctx} />
        <BusinessName ctx={ctx} style={{ marginTop: 4, textAlign: 'center' }} />
        <BusinessDetails ctx={ctx} align="center" />
        <Text style={{ fontFamily: ctx.head, fontWeight: 700, fontSize: ctx.fz.lg, marginTop: 10, letterSpacing: 2 }}>{ctx.title}</Text>
      </View>
      <Dashed ctx={ctx} />
      <MetaRows ctx={ctx} align="left" />
      <View style={{ marginTop: 6 }}>
        <ClientBlock ctx={ctx} />
      </View>
      <Dashed ctx={ctx} />
      {ctx.inv.items.map((item) => (
        <View key={item.id} wrap={false} style={{ marginBottom: 6 }}>
          <Text style={{ fontWeight: 700 }}>{item.description || '-'}</Text>
          {item.detail ? <Text style={{ color: ctx.c.muted, fontSize: ctx.fz.sm }}>{item.detail}</Text> : null}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: ctx.c.muted }}>
              {ctx.num(item.qty)}
              {ctx.tpl.show.unit && item.unit ? ` ${item.unit}` : ''} x {ctx.money(item.price)}
              {item.discount.value > 0 ? `  (-${item.discount.type === 'percent' ? ctx.num(item.discount.value) + '%' : ctx.money(item.discount.value)})` : ''}
            </Text>
            <Text>{ctx.money(lineTotals(item, ctx.inv.currency).net)}</Text>
          </View>
        </View>
      ))}
      <Dashed ctx={ctx} />
      {rows.map(([k, v], i) => (
        <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
          <Text style={{ color: ctx.c.muted }}>{k}</Text>
          <Text>{v}</Text>
        </View>
      ))}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={{ fontWeight: 700, fontSize: ctx.fz.lg }}>{ctx.L.grandTotal}</Text>
        <Text style={{ fontWeight: 700, fontSize: ctx.fz.lg }}>{ctx.money(ctx.t.grandTotal)}</Text>
      </View>
      {ctx.t.paid > 0 && (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
            <Text style={{ color: ctx.c.muted }}>{ctx.L.paid}</Text>
            <Text>-{ctx.money(ctx.t.paid)}</Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
            <Text style={{ fontWeight: 700 }}>{ctx.L.balance}</Text>
            <Text style={{ fontWeight: 700 }}>{ctx.money(Math.max(ctx.t.balance, 0))}</Text>
          </View>
        </>
      )}
      <Terbilang ctx={ctx} />
      <Dashed ctx={ctx} />
      <PaymentInfo ctx={ctx} />
      <View style={{ marginTop: ctx.gap, flexDirection: 'row', justifyContent: 'center' }}>
        <Signature ctx={ctx} />
      </View>
      <View style={{ marginTop: ctx.gap }}>
        <NotesTerms ctx={ctx} />
      </View>
      <PageFooter ctx={ctx} />
    </Page>
  );
}
