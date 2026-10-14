import type { LayoutKey, TemplateConfig } from '../types';

type C = 'p' | 'a' | 't' | 's' | 'w';
// x, y, w, h in percent of the page; r rounds the corners, o makes a circle.
type Shape = [number, number, number, number, C, ('r' | 'o')?];

const rows = (y: number, n = 4, x = 8, w = 84): Shape[] => Array.from({ length: n }, (_, i) => [x, y + i * 5, w, 1.4, 't'] as Shape);

const SKETCH: Record<LayoutKey, Shape[]> = {
  arsip: [[8, 7, 14, 6, 't'], [62, 7, 30, 4, 'p'], [70, 13, 22, 2, 'a'], [8, 22, 84, 0.8, 'p'], [8, 26, 30, 2, 't'], [8, 36, 84, 1, 'p'], ...rows(41), [62, 64, 30, 3, 't']],
  kop: [[8, 6, 12, 8, 't'], [30, 7, 40, 3, 'p'], [35, 12, 30, 1.5, 't'], [8, 18, 84, 1.2, 'p'], [35, 23, 30, 2.5, 't'], [8, 32, 84, 22, 'w'], ...rows(36), [62, 60, 30, 3, 't']],
  korporat: [[8, 7, 16, 6, 't'], [64, 7, 28, 4, 'p'], [8, 17, 64, 6, 'p'], [72, 17, 20, 6, 'a'], [8, 28, 26, 2, 't'], [50, 28, 26, 2, 't'], [8, 38, 84, 3, 's'], ...rows(44), [60, 66, 32, 4, 'p']],
  anggun: [[40, 6, 20, 5, 't'], [8, 15, 84, 0.8, 'a'], [32, 19, 36, 4, 'p'], [8, 28, 26, 2, 't'], [8, 38, 84, 0.8, 'a'], ...rows(42), [62, 64, 30, 3, 't']],
  bingkai: [[4, 3, 92, 94, 'w'], [40, 8, 20, 5, 't'], [12, 19, 76, 0.8, 'a'], [34, 17, 32, 4, 'p'], [12, 28, 26, 2, 't'], [12, 38, 76, 0.8, 'a'], ...rows(42, 4, 12, 76), [58, 64, 30, 3, 't']],
  pita: [[0, 0, 100, 18, 'p'], [62, 6, 30, 4, 'w'], [8, 6, 20, 3, 'w'], [8, 24, 30, 2, 't'], [8, 34, 84, 3, 's'], ...rows(40), [60, 62, 32, 4, 'p']],
  kartu: [[8, 7, 24, 4, 't'], [64, 7, 28, 4, 'p'], [8, 18, 46, 13, 's', 'r'], [57, 18, 35, 13, 's', 'r'], [8, 36, 84, 3, 's', 'r'], ...rows(42), [60, 63, 32, 4, 'p', 'r'], [8, 72, 84, 9, 's', 'r']],
  samping: [[0, 0, 30, 100, 'p'], [5, 6, 18, 3, 'w'], [5, 40, 16, 2, 'a'], [36, 7, 30, 4, 'p'], [36, 18, 26, 2, 't'], [36, 30, 56, 1, 'p'], ...rows(35, 4, 36, 56), [62, 58, 30, 4, 'p']],
  lengkung: [[0, 0, 100, 18, 'p'], [70, -14, 40, 30, 'w', 'o'], [8, 6, 22, 3, 'w'], [8, 24, 30, 2, 't'], [8, 34, 84, 3, 's'], ...rows(40), [60, 62, 32, 4, 'p']],
  tegas: [[8, 6, 50, 7, 'p'], [8, 18, 84, 1.2, 'a'], [8, 22, 24, 2, 't'], [38, 22, 24, 2, 't'], [8, 30, 84, 8, 'p'], ...rows(44), [62, 66, 30, 3, 't']],
  studio: [[8, 6, 20, 2, 't'], [8, 16, 60, 8, 'p'], [8, 27, 10, 1, 'a'], [8, 33, 22, 2, 't'], [38, 33, 22, 2, 't'], [68, 33, 22, 2, 't'], ...rows(43), [62, 64, 30, 3, 't']],
  geometri: [[70, -8, 38, 27, 'p', 'o'], [62, 9, 13, 9, 'a', 'o'], [8, 7, 40, 6, 'p'], [8, 15, 14, 2, 'a'], [8, 30, 84, 0.8, 'p'], [8, 38, 84, 3, 'p'], ...rows(44), [60, 64, 32, 4, 'a'], [0, 98, 22, 2, 'p']],
  garis: [[8, 7, 12, 4, 't'], [8, 18, 14, 1.5, 't'], [8, 21, 46, 5, 'p'], [8, 28, 8, 1, 'a'], [8, 36, 26, 2, 't'], ...rows(46), [62, 68, 30, 3, 't']],
  struk: [[38, 6, 24, 3, 't'], [36, 12, 28, 2.5, 'p'], ...rows(22, 6, 22, 56), [22, 56, 56, 0.6, 't'], [50, 60, 28, 3, 'p']],
};

export function LayoutSketch({ layout, colors }: { layout: LayoutKey; colors: TemplateConfig['colors'] }) {
  const fill: Record<C, string> = {
    p: colors.primary,
    a: colors.accent,
    t: `color-mix(in srgb, ${colors.text} 22%, ${colors.paper})`,
    s: `color-mix(in srgb, ${colors.primary} 12%, ${colors.paper})`,
    w: 'transparent',
  };
  return (
    <div className="relative aspect-[210/297] w-full overflow-hidden rounded-md border border-line" style={{ background: colors.paper }} aria-hidden="true">
      {SKETCH[layout].map(([x, y, w, h, c, shape], i) => (
        <span
          key={i}
          className="absolute"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${w}%`,
            height: `${h}%`,
            background: c === 'w' && (layout === 'pita' || layout === 'samping' || layout === 'lengkung') ? 'rgba(255,255,255,.55)' : fill[c],
            border: c === 'w' && (layout === 'kop' || layout === 'bingkai') ? `1px solid ${layout === 'kop' ? fill.t : colors.primary}` : undefined,
            borderRadius: shape === 'o' ? '50%' : shape === 'r' ? 3 : 1,
          }}
        />
      ))}
    </div>
  );
}
