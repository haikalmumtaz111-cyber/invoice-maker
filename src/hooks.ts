import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getSettings } from './db';
import { BUILTIN_TEMPLATES, normalizeTemplate } from './templates';
import type { Invoice, Settings, Status, TemplateConfig } from './types';

export function useSettings(): Settings | undefined {
  return useLiveQuery(() => getSettings(), []);
}

export function useAllTemplates(): TemplateConfig[] | undefined {
  return useLiveQuery(async () => {
    const custom = await db.templates.orderBy('updatedAt').reverse().toArray();
    return [...custom.map(normalizeTemplate), ...BUILTIN_TEMPLATES];
  }, []);
}

interface PdfState {
  blob: Blob | null;
  busy: boolean;
  error: string | null;
}

export function useInvoicePdf(
  inv: Invoice | undefined,
  tpl: TemplateConfig | undefined,
  settings: Settings | undefined,
  status: Status,
  delay = 350,
): PdfState {
  const [state, setState] = useState<PdfState>({ blob: null, busy: false, error: null });
  const run = useRef(0);
  // Live queries return a new object only when the record changes, so identity is enough; stringifying would
  // serialise the base64 logo, signature and QRIS on every keystroke.
  useEffect(() => {
    if (!inv || !tpl || !settings) return;
    const id = ++run.current;
    setState((s) => ({ ...s, busy: true }));
    const timer = setTimeout(async () => {
      try {
        const { renderInvoicePdf } = await import('./pdf/document');
        const blob = await renderInvoicePdf(inv, tpl, settings, status);
        if (id === run.current) setState({ blob, busy: false, error: null });
      } catch (e) {
        if (id === run.current) setState((s) => ({ ...s, busy: false, error: (e as Error).message || 'PDF gagal dibuat.' }));
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [inv, tpl, settings, status]);

  return state;
}

export function useWide(query = '(min-width: 1024px)') {
  const [wide, setWide] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const fn = () => setWide(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, [query]);
  return wide;
}

export function useDebouncedEffect(fn: () => void, deps: unknown[], delay: number) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    const t = setTimeout(() => saved.current(), delay);
    return () => clearTimeout(t);
  }, deps);
}

export function useStoredState<T>(key: string, initial: T, storage: 'local' | 'session' = 'local') {
  const store = () => (storage === 'local' ? localStorage : sessionStorage);
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = store().getItem(key);
      return raw === null ? initial : (JSON.parse(raw) as T);
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      store().setItem(key, JSON.stringify(value));
    } catch {
      /* private mode */
    }
  }, [key, value]);
  return [value, setValue] as const;
}
