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
} from './parts';
import { SenderBlock, TotalsArea, pageStyle } from './layouts';

const amountDue = (ctx: DocCtx) => (ctx.t.paid > 0 && ctx.t.balance > 0 ? ctx.t.balance : ctx.t.grandTotal);
const amountLabel = (ctx: DocCtx) => (ctx.t.paid > 0 && ctx.t.balance > 0 ? ctx.L.balance : ctx.L.grandTotal);
const onColor = (bg: string) => {
  const fg = readableOn(bg);
  return { fg, soft: hexAlpha(fg === '#ffffff' ? '#ffffff' : '#000000', 0.72) };
};

function SignatureRow({ ctx, labelColor }: { ctx: DocCtx; labelColor?: string }) {
  return (
    <View style={{ marginTop: ctx.gap, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }}>
      <View style={{ flex: 1 }}>
        <NotesTerms ctx={ctx} labelColor={labelColor} />
      </View>
      <Signature ctx={ctx} />
    </View>
  );
}

export function Kop({ ctx }: { ctx: DocCtx }) {
  const align = ctx.tpl.logo.align;
  const hasLogo = ctx.tpl.show.logo && !!ctx.s.business.logo;
  const inRow = align !== 'center' && hasLogo;
  const letterhead = (
    <View style={{ flex: inRow ? 1 : undefined, alignItems: 'center' }}>
      <BusinessName ctx={ctx} style={{ fontSize: ctx.fz.xl + 2, textAlign: 'center', color: ctx.c.primary, letterSpacing: 0.5 }} />
      <BusinessDetails ctx={ctx} align="center" />
    </View>
  );
  return (
    <Page size={ctx.size} style={pageStyle(ctx)}>
      <PageDecor ctx={ctx} />
      {!inRow ? (
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Logo ctx={ctx} />
          {letterhead}
        </View>
      ) : (
        <View style={{ flexDirection: align === 'right' ? 'row-reverse' : 'row', alignItems: 'center', gap: 14 }}>
          <View style={{ width: 90, alignItems: align === 'right' ? 'flex-end' : 'flex-start' }}>
            <Logo ctx={ctx} />
          </View>
          {letterhead}
          <View style={{ width: 90 }} />
        </View>
      )}
      <View style={{ marginTop: ctx.gap * 0.7 }}>
        <View style={{ height: 2.5, backgroundColor: ctx.c.primary }} />
        <View style={{ height: 0.8, backgroundColor: ctx.c.primary, marginTop: 1.5 }} />
      </View>
      <View style={{ alignItems: 'center', marginVertical: ctx.gap * 0.9 }}>
        <Text style={{ fontFamily: ctx.head, fontWeight: 700, fontSize: ctx.fz.xl, color: ctx.c.text, letterSpacing: 1.5 }}>{ctx.title}</Text>
        <View style={{ width: 60, height: 1.5, backgroundColor: ctx.c.accent, marginTop: 3 }} />
        <Text style={{ fontSize: ctx.fz.base, color: ctx.c.muted, marginTop: 4 }}>
          {ctx.L.number} {ctx.inv.number}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 20 }}>
        <View style={{ flex: 1 }}>
          <ClientBlock ctx={ctx} />
        </View>
        <MetaRows ctx={ctx} withNumber={false} />
      </View>
      <View style={{ marginTop: ctx.gap }}>
        <ItemsTable ctx={ctx} style={{ headBg: hexAlpha(ctx.c.primary, 0.08), headColor: ctx.c.text, grid: hexAlpha(ctx.c.text, 0.35), uppercase: true }} />
      </View>
      <TotalsArea ctx={ctx} />
      <BottomSection ctx={ctx} />
      <PageFooter ctx={ctx} />
    </Page>
  );
}

export function Korporat({ ctx }: { ctx: DocCtx }) {
  const right = ctx.tpl.logo.align === 'right';
  const { fg, soft } = onColor(ctx.c.primary);
  const cells: [string, string, boolean?][] = [
    [ctx.L.number, ctx.inv.number],
    [ctx.L.issueDate, ctx.date(ctx.inv.issueDate)],
  ];
  if (ctx.inv.dueDate && ctx.tpl.show.dueDate) cells.push([ctx.L.dueDate, ctx.date(ctx.inv.dueDate)]);
  cells.push([amountLabel(ctx), ctx.money(amountDue(ctx)), true]);
  return (
    <Page size={ctx.size} style={pageStyle(ctx)}>
      <PageDecor ctx={ctx} />
      <View style={{ flexDirection: right ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ maxWidth: '58%' }}>
          <SenderBlock ctx={ctx} align={right ? 'right' : 'left'} />
        </View>
        <Text style={{ fontFamily: ctx.head, fontWeight: 700, fontSize: ctx.fz.xxl, color: ctx.c.primary, letterSpacing: 1 }}>{ctx.title}</Text>
      </View>
      <View style={{ flexDirection: 'row', marginTop: ctx.gap, backgroundColor: ctx.c.primary, borderRadius: ctx.radius }}>
        {cells.map(([k, v, strong], i) => (
          <View
            key={k}
            style={{
              flex: strong ? 1.4 : 1,
              paddingVertical: 9,
              paddingHorizontal: 12,
              borderLeftWidth: i ? 0.6 : 0,
              borderLeftColor: hexAlpha(fg === '#ffffff' ? '#ffffff' : '#000000', 0.25),
              backgroundColor: strong ? ctx.c.accent : undefined,
              borderTopRightRadius: strong ? ctx.radius : 0,
              borderBottomRightRadius: strong ? ctx.radius : 0,
            }}
          >
            <Text style={{ fontSize: ctx.fz.xs, color: strong ? onColor(ctx.c.accent).soft : soft, fontWeight: 700, letterSpacing: 0.4 }}>{k.toUpperCase()}</Text>
            <Text style={{ fontSize: strong ? ctx.fz.lg + 1 : ctx.fz.base, color: strong ? readableOn(ctx.c.accent) : fg, fontWeight: 700, marginTop: 2, fontFamily: strong ? ctx.head : ctx.body }}>{v}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', marginTop: ctx.gap, gap: 24 }}>
        <View style={{ flex: 1 }}>
          <ClientBlock ctx={ctx} labelColor={ctx.c.primary} />
          {ctx.inv.reference && ctx.tpl.show.reference ? (
            <Text style={{ fontSize: ctx.fz.sm, color: ctx.c.muted, marginTop: 4 }}>
              {ctx.L.reference}: {ctx.inv.reference}
            </Text>
          ) : null}
        </View>
        <View style={{ flex: 1 }}>
          <PaymentInfo ctx={ctx} labelColor={ctx.c.primary} />
        </View>
      </View>
      <View style={{ marginTop: ctx.gap }}>
        <ItemsTable ctx={ctx} style={{ headBg: hexAlpha(ctx.c.primary, 0.1), headColor: ctx.c.primary, uppercase: true }} />
      </View>
      <TotalsArea ctx={ctx} highlight={{ bg: ctx.c.primary }} />
      <SignatureRow ctx={ctx} labelColor={ctx.c.primary} />
      <PageFooter ctx={ctx} />
    </Page>
  );
}

export function Kartu({ ctx }: { ctx: DocCtx }) {
  const r = Math.max(ctx.radius, 6);
  const soft = hexAlpha(ctx.c.primary, 0.07);
  const align = ctx.tpl.logo.align;
  const card = { backgroundColor: soft, borderRadius: r, padding: 12 };
  return (
    <Page size={ctx.size} style={pageStyle(ctx)}>
      <PageDecor ctx={ctx} />
      <View style={{ flexDirection: align === 'right' ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, maxWidth: '60%' }}>
          <Logo ctx={ctx} />
          <View>
            <BusinessName ctx={ctx} />
            <BusinessDetails ctx={ctx} />
          </View>
        </View>
        <View style={{ alignItems: align === 'right' ? 'flex-start' : 'flex-end' }}>
          <Text style={{ fontFamily: ctx.head, fontWeight: 700, fontSize: ctx.fz.xxl, color: ctx.c.primary }}>{ctx.title}</Text>
          <View style={{ marginTop: 4, backgroundColor: hexAlpha(ctx.c.accent, 0.18), borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 }}>
            <Text style={{ fontSize: ctx.fz.sm, fontWeight: 700, color: ctx.c.text }}>{ctx.inv.number}</Text>
          </View>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: ctx.gap }}>
        <View style={[card, { flex: 1.3 }]}>
          <ClientBlock ctx={ctx} labelColor={ctx.c.primary} />
        </View>
        <View style={[card, { flex: 1 }]}>
          <MetaRows ctx={ctx} withNumber={false} align="left" labelColor={ctx.c.primary} />
          <View style={{ marginTop: 6, paddingTop: 6, borderTopWidth: 0.6, borderTopColor: hexAlpha(ctx.c.primary, 0.2) }}>
            <Label ctx={ctx} color={ctx.c.primary}>
              {amountLabel(ctx)}
            </Label>
            <Text style={{ fontFamily: ctx.head, fontWeight: 700, fontSize: ctx.fz.xl, color: ctx.c.text }}>{ctx.money(amountDue(ctx))}</Text>
          </View>
        </View>
      </View>
      <View style={{ marginTop: ctx.gap }}>
        <ItemsTable ctx={ctx} style={{ headBg: soft, headColor: ctx.c.primary, rowBorder: hexAlpha(ctx.c.primary, 0.1) }} />
      </View>
      <TotalsArea ctx={ctx} highlight={{ bg: ctx.c.primary }} />
      <View wrap={false} style={[card, { marginTop: ctx.gap, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20 }]}>
        <View style={{ flex: 1 }}>
          <PaymentInfo ctx={ctx} labelColor={ctx.c.primary} />
        </View>
        <Signature ctx={ctx} />
      </View>
      <View style={{ marginTop: ctx.gap }}>
        <NotesTerms ctx={ctx} labelColor={ctx.c.primary} />
      </View>
      <PageFooter ctx={ctx} />
    </Page>
  );
}

export function Bingkai({ ctx }: { ctx: DocCtx }) {
  const inset = 16;
  const rule = (flex = 1) => <View style={{ flex, height: 0.8, backgroundColor: ctx.c.accent }} />;
  return (
    <Page size={ctx.size} style={pageStyle(ctx, { paddingHorizontal: ctx.pad + 14, paddingTop: ctx.pad + 2, paddingBottom: ctx.pad + 22 })}>
      <View fixed style={{ position: 'absolute', top: inset, left: inset, right: inset, bottom: inset, borderWidth: 1.6, borderColor: ctx.c.primary }} />
      <View fixed style={{ position: 'absolute', top: inset + 4, left: inset + 4, right: inset + 4, bottom: inset + 4, borderWidth: 0.6, borderColor: ctx.c.accent }} />
      <PageDecor ctx={ctx} />
      <View style={{ alignItems: 'center' }}>
        <Logo ctx={ctx} />
        <BusinessName ctx={ctx} style={{ fontSize: ctx.fz.xl, marginTop: 6, textAlign: 'center', color: ctx.c.primary, letterSpacing: 0.5 }} />
        <BusinessDetails ctx={ctx} align="center" />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: ctx.gap * 0.7 }}>
        {rule()}
        <View style={{ width: 6, height: 6, backgroundColor: ctx.c.accent, transform: 'rotate(45deg)' }} />
        <Text style={{ fontFamily: ctx.head, fontSize: ctx.fz.xxl - 4, color: ctx.c.primary, letterSpacing: 3 }}>{ctx.title}</Text>
        <View style={{ width: 6, height: 6, backgroundColor: ctx.c.accent, transform: 'rotate(45deg)' }} />
        {rule()}
      </View>
      <Text style={{ textAlign: 'center', fontSize: ctx.fz.base, color: ctx.c.accent, marginTop: 4, marginBottom: ctx.gap * 0.6, letterSpacing: 1 }}>{ctx.inv.number}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 20 }}>
        <View style={{ flex: 1 }}>
          <ClientBlock ctx={ctx} labelColor={ctx.c.accent} />
        </View>
        <MetaRows ctx={ctx} withNumber={false} labelColor={ctx.c.accent} />
      </View>
      <View style={{ marginTop: ctx.gap }}>
        <ItemsTable ctx={ctx} style={{ headBorder: ctx.c.accent, headColor: ctx.c.primary }} />
      </View>
      <TotalsArea ctx={ctx} />
      <BottomSection ctx={ctx} labelColor={ctx.c.accent} />
      <PageFooter ctx={ctx} />
    </Page>
  );
}

export function Studio({ ctx }: { ctx: DocCtx }) {
  const right = ctx.tpl.logo.align === 'right';
  return (
    <Page size={ctx.size} style={pageStyle(ctx, { paddingTop: ctx.pad + 6 })}>
      <PageDecor ctx={ctx} />
      <View style={{ flexDirection: right ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Logo ctx={ctx} />
          <BusinessName ctx={ctx} style={{ fontSize: ctx.fz.base + 1 }} />
        </View>
        <Text style={{ fontSize: ctx.fz.sm, color: ctx.c.muted, letterSpacing: 1 }}>
          {ctx.title} · {ctx.inv.number}
        </Text>
      </View>
      <View style={{ marginTop: ctx.gap * 1.3 }}>
        <Text style={{ fontSize: ctx.fz.sm, color: ctx.c.muted, letterSpacing: 0.5 }}>{amountLabel(ctx)}</Text>
        <Text style={{ fontFamily: ctx.head, fontWeight: 700, fontSize: ctx.fz.xxl * 1.6, color: ctx.c.primary, letterSpacing: -1.5, lineHeight: 1.05, marginTop: 2 }}>
          {ctx.money(amountDue(ctx))}
        </Text>
        {ctx.inv.dueDate && ctx.tpl.show.dueDate ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 }}>
            <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: ctx.c.accent }} />
            <Text style={{ fontSize: ctx.fz.base, color: ctx.c.text }}>
              {ctx.L.dueDate} {ctx.date(ctx.inv.dueDate)}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={{ width: 48, height: 3, backgroundColor: ctx.c.accent, marginVertical: ctx.gap }} />
      <View style={{ flexDirection: 'row', gap: 22 }}>
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
      <View style={{ marginTop: ctx.gap }}>
        <ItemsTable ctx={ctx} style={{ headColor: ctx.c.muted, rowBorder: hexAlpha(ctx.c.text, 0.08), uppercase: true }} />
      </View>
      <TotalsArea ctx={ctx} />
      <BottomSection ctx={ctx} />
      <PageFooter ctx={ctx} />
    </Page>
  );
}

export function Lengkung({ ctx }: { ctx: DocCtx }) {
  const bg = ctx.c.primary;
  const { fg, soft } = onColor(bg);
  return (
    <Page size={ctx.size} style={pageStyle(ctx, { paddingHorizontal: 0 })}>
      <PageDecor ctx={ctx} />
      <View style={{ marginTop: -ctx.pad, backgroundColor: bg, borderBottomRightRadius: 90, overflow: 'hidden', paddingHorizontal: ctx.pad, paddingTop: ctx.pad, paddingBottom: ctx.gap + 16 }}>
        <View style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, right: -70, top: -120, backgroundColor: fg, opacity: 0.1 }} />
        <View style={{ position: 'absolute', width: 90, height: 90, borderRadius: 45, right: 150, bottom: -40, backgroundColor: ctx.c.accent, opacity: 0.35 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ maxWidth: '58%' }}>
            {ctx.tpl.show.logo && ctx.s.business.logo ? (
              <View style={{ backgroundColor: '#ffffff', padding: 6, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 }}>
                <Logo ctx={ctx} />
              </View>
            ) : null}
            <BusinessName ctx={ctx} style={{ color: fg }} taglineColor={soft} />
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
            <ClientBlock ctx={ctx} labelColor={bg} />
          </View>
          <MetaRows ctx={ctx} withNumber={false} labelColor={bg} />
        </View>
        <View style={{ marginTop: ctx.gap }}>
          <ItemsTable ctx={ctx} style={{ headBg: hexAlpha(bg, 0.1), headColor: bg, rowBorder: hexAlpha(bg, 0.14) }} />
        </View>
        <TotalsArea ctx={ctx} highlight={{ bg }} />
        <BottomSection ctx={ctx} labelColor={bg} />
      </View>
      <PageFooter ctx={ctx} />
    </Page>
  );
}

export function Geometri({ ctx }: { ctx: DocCtx }) {
  const p = ctx.c.primary;
  const a = ctx.c.accent;
  return (
    <Page size={ctx.size} style={pageStyle(ctx)}>
      <PageDecor ctx={ctx} />
      <View style={{ position: 'absolute', width: 190, height: 190, borderRadius: 95, right: -60, top: -70, backgroundColor: p }} />
      <View style={{ position: 'absolute', width: 70, height: 70, borderRadius: 35, right: 96, top: 62, backgroundColor: a, opacity: 0.85 }} />
      <View style={{ position: 'absolute', width: 26, height: 26, right: 40, top: 140, borderWidth: 3, borderColor: a, transform: 'rotate(20deg)' }} />
      <View fixed style={{ position: 'absolute', left: 0, bottom: 0, flexDirection: 'row' }}>
        <View style={{ width: 90, height: 8, backgroundColor: p }} />
        <View style={{ width: 40, height: 8, backgroundColor: a }} />
        <View style={{ width: 20, height: 8, backgroundColor: hexAlpha(p, 0.4) }} />
      </View>
      <View style={{ maxWidth: '62%' }}>
        <Text style={{ fontFamily: ctx.head, fontWeight: 700, fontSize: ctx.fz.xxl * 1.3, color: p, letterSpacing: -0.5, lineHeight: 1 }}>{ctx.title}</Text>
        <View style={{ alignSelf: 'flex-start', marginTop: 8, backgroundColor: a, paddingVertical: 3, paddingHorizontal: 9 }}>
          <Text style={{ fontSize: ctx.fz.sm, fontWeight: 700, color: readableOn(a) }}>{ctx.inv.number}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: ctx.gap * 1.2, maxWidth: '62%' }}>
        <Logo ctx={ctx} />
        <View>
          <BusinessName ctx={ctx} />
          <BusinessDetails ctx={ctx} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: ctx.gap, gap: 20, borderTopWidth: 2, borderTopColor: p, paddingTop: 10 }}>
        <View style={{ flex: 1 }}>
          <ClientBlock ctx={ctx} labelColor={p} />
        </View>
        <MetaRows ctx={ctx} withNumber={false} labelColor={p} />
      </View>
      <View style={{ marginTop: ctx.gap }}>
        <ItemsTable ctx={ctx} style={{ headBg: p, headColor: readableOn(p), rowBorder: hexAlpha(p, 0.15) }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: ctx.gap * 0.7, gap: 24 }}>
        <View style={{ flex: 1 }}>
          <Terbilang ctx={ctx} color={p} />
          <StatusStamp ctx={ctx} />
        </View>
        <TotalsBlock ctx={ctx} highlight={{ bg: a }} />
      </View>
      <BottomSection ctx={ctx} labelColor={p} />
      <PageFooter ctx={ctx} />
    </Page>
  );
}
