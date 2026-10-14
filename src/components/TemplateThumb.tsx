import { useEffect, useState } from 'react';
import type { Settings, TemplateConfig } from '../types';
import { sampleInvoice, sampleSettings } from '../lib/sample';
import { loadPdfJs } from './PdfPreview';
import RENDER_VERSION from 'virtual:render-version';

const cache = new Map<string, string>();
let queue: Promise<unknown> = Promise.resolve();
const STORE_PREFIX = `thumb:${RENDER_VERSION}:`;

try {
  Object.keys(localStorage)
    .filter((k) => k.startsWith('thumb:') && !k.startsWith(STORE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
} catch {
  /* storage unavailable */
}

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

function readStored(key: string): string | null {
  try {
    return localStorage.getItem(STORE_PREFIX + key);
  } catch {
    return null;
  }
}

function store(key: string, url: string) {
  try {
    localStorage.setItem(STORE_PREFIX + key, url);
  } catch {
    // Quota full: drop old thumbnails and keep going without persisting.
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(STORE_PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* storage unavailable */
    }
  }
}

// Thumbnails render one at a time; rendering all templates in parallel freezes low-end phones.
function renderThumb(tpl: TemplateConfig, s: Settings): Promise<string> {
  const key = hash(JSON.stringify([tpl, s.business, s.bankAccounts, s.signature, s.stamp, s.qris, s.defaults]));
  const hit = cache.get(key) ?? readStored(key);
  if (hit) {
    cache.set(key, hit);
    return Promise.resolve(hit);
  }
  const job = queue.then(async () => {
    const ss = sampleSettings(s);
    const inv = sampleInvoice(ss, tpl.id);
    const { renderInvoicePdf } = await import('../pdf/document');
    const blob = await renderInvoicePdf(inv, tpl, ss, 'sent');
    const pdfjs = await loadPdfJs();
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) }).promise;
    const page = await doc.getPage(1);
    const base = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: 400 / base.width });
    const canvas = document.createElement('canvas');
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
    doc.destroy();
    const url = canvas.toDataURL('image/webp', 0.8);
    cache.set(key, url);
    store(key, url);
    return url;
  });
  queue = job.catch(() => undefined);
  return job;
}

export function TemplateThumb({ tpl, settings, alt }: { tpl: TemplateConfig; settings: Settings; alt: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let live = true;
    setFailed(false);
    renderThumb(tpl, settings)
      .then((u) => live && setSrc(u))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [tpl, settings]);

  return (
    <div className="relative aspect-[210/297] overflow-hidden rounded-md border border-line bg-white">
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover object-top" />
      ) : (
        <div className="grid size-full place-items-center p-2 text-center text-xs text-[#57534e]">{failed ? 'Preview gagal dibuat' : 'Menyiapkan preview...'}</div>
      )}
    </div>
  );
}
