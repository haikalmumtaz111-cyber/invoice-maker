import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { formatNumber, parseNumber } from '../lib/money';
import type { Lang } from '../types';
import { IconChevronDown, IconClose } from './icons';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'clay';

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-bg hover:opacity-90',
  clay: 'bg-clay text-white dark:text-[#0a0a0a] hover:opacity-90',
  secondary: 'bg-surface text-text border border-line hover:bg-sunken',
  ghost: 'text-text hover:bg-sunken',
  danger: 'bg-surface text-danger border border-danger/40 hover:bg-danger/10',
};

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'md' | 'lg' | 'sm'; block?: boolean }>(
  function Button({ variant = 'secondary', size = 'md', block, className = '', type = 'button', ...rest }, ref) {
    const sizes = { sm: 'min-h-9 px-3 text-sm', md: 'min-h-11 px-4 text-sm', lg: 'min-h-12 px-5 text-base' };
    return (
      <button
        ref={ref}
        type={type}
        className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${block ? 'w-full' : ''} ${className}`}
        {...rest}
      />
    );
  },
);

export function IconButton({ label, className = '', children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-grid size-11 shrink-0 place-items-center rounded-xl text-text hover:bg-sunken disabled:opacity-40 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function Field({ label, hint, children, htmlFor, className = '' }: { label: ReactNode; hint?: ReactNode; children: ReactNode; htmlFor?: string; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-[13px] font-semibold text-text">
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

const inputBase =
  'w-full min-w-0 rounded-xl border border-line bg-surface px-3 text-text placeholder:text-muted/70 focus:border-clay focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-0';

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput({ className = '', ...rest }, ref) {
  return <input ref={ref} className={`${inputBase} min-h-11 ${className}`} {...rest} />;
});

export function TextArea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={2} className={`${inputBase} min-h-11 py-2.5 leading-relaxed ${className}`} {...rest} />;
}

export function Select({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative inline-flex w-full items-center">
      <select
        className={`${inputBase} min-h-11 w-full appearance-none pr-10 cursor-pointer ${className}`}
        {...rest}
      >
        {children}
      </select>
      <IconChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

// Keeps the raw text while focused so typing "1.5" or "1,5" isn't reformatted mid-keystroke.
export function NumberInput({
  value,
  onChange,
  lang = 'id',
  decimals = 2,
  className = '',
  prefix,
  suffix,
  allowNegative = false,
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'prefix'> & {
  value: number;
  onChange: (n: number) => void;
  lang?: Lang;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  allowNegative?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? (value ? formatNumber(value, lang, decimals) : '');
  return (
    <div className={`relative flex items-center ${className}`}>
      {prefix && <span className="pointer-events-none absolute left-3 text-sm text-muted">{prefix}</span>}
      <input
        inputMode={decimals > 0 ? 'decimal' : 'numeric'}
        className={`${inputBase} num min-h-11 text-right ${prefix ? 'pl-11' : ''} ${suffix ? 'pr-9' : ''}`}
        value={display}
        onFocus={(e) => {
          setDraft(value ? formatNumber(value, lang, decimals) : '');
          requestAnimationFrame(() => e.target.select());
        }}
        onChange={(e) => {
          const raw = allowNegative ? e.target.value : e.target.value.replace(/-/g, '');
          setDraft(raw);
          onChange(parseNumber(raw, lang));
        }}
        onBlur={() => setDraft(null)}
        {...rest}
      />
      {suffix && <span className="pointer-events-none absolute right-3 text-sm text-muted">{suffix}</span>}
    </div>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; hint?: ReactNode }) {
  const id = useId();
  return (
    <div className="flex min-h-11 items-center justify-between gap-3">
      <label htmlFor={id} className="min-w-0 flex-1 cursor-pointer">
        <span className="block text-sm font-semibold">{label}</span>
        {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-clay ${
          checked ? 'bg-clay' : 'bg-line'
        }`}
      >
        <span
          className={`pointer-events-none inline-block size-6 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-xl border border-line bg-sunken p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`min-h-9 flex-1 rounded-lg px-2 text-sm font-semibold transition-colors ${value === o.value ? 'bg-surface text-text shadow-sm' : 'text-muted hover:text-text'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-surface p-4 ${className}`}>{children}</section>;
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 flex min-h-9 items-center justify-between gap-2">
      <h2 className="text-[15px] font-bold">{children}</h2>
      {action}
    </div>
  );
}

export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-3xl border-t border-line bg-surface p-0 text-text backdrop:bg-black/50 backdrop:backdrop-blur-xs sm:m-auto sm:max-h-[85dvh] sm:max-w-xl sm:rounded-2xl sm:border sm:shadow-2xl"
    >
      {open && (
        <div className="flex max-h-[92dvh] flex-col sm:max-h-[85dvh]">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5 sm:px-6 sm:py-4">
            <h2 className="text-base font-bold tracking-tight">{title}</h2>
            <IconButton label="Tutup" onClick={onClose} className="-mr-1">
              <IconClose size={18} />
            </IconButton>
          </div>
          <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{children}</div>
          {footer && (
            <div className="border-t border-line bg-surface px-5 pt-4 pb-[max(1.25rem,calc(env(safe-area-inset-bottom)+0.75rem))] sm:px-6 sm:py-5 sm:rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      )}
    </dialog>
  );
}

interface ConfirmOpts {
  title: string;
  message?: ReactNode;
  confirmLabel: string;
  danger?: boolean;
}

interface ToastAction {
  label: string;
  onClick: () => void;
}

type ToastFn = (msg: string, kind?: 'ok' | 'error', action?: ToastAction) => void;

const ToastCtx = createContext<{ toast: ToastFn; confirm: (o: ConfirmOpts) => Promise<boolean> }>({
  toast: () => {},
  confirm: async () => false,
});

export function useUI() {
  return useContext(ToastCtx);
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; msg: string; kind: 'ok' | 'error'; action?: ToastAction }[]>([]);
  const [pending, setPending] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);

  const toast = useCallback<ToastFn>((msg, kind = 'ok', action) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, kind, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' || action ? 6000 : 3000);
  }, []);

  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setPending({ ...o, resolve })), []);

  const close = (v: boolean) => {
    pending?.resolve(v);
    setPending(null);
  };

  return (
    <ToastCtx.Provider value={{ toast, confirm }}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex max-w-md items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${t.kind === 'error' ? 'bg-danger text-white dark:text-[#0a0a0a]' : 'bg-ink text-bg'}`}
          >
            <span>{t.msg}</span>
            {t.action && (
              <button
                type="button"
                className="-my-1 shrink-0 rounded-lg px-2 py-1 font-bold underline underline-offset-2 hover:bg-white/10"
                onClick={() => {
                  t.action!.onClick();
                  setToasts((all) => all.filter((x) => x.id !== t.id));
                }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        ))}
      </div>
      <Sheet
        open={!!pending}
        onClose={() => close(false)}
        title={pending?.title ?? ''}
        footer={
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 w-full">
            <Button onClick={() => close(false)} className="sm:min-w-24">
              Batal
            </Button>
            <Button variant={pending?.danger ? 'danger' : 'primary'} onClick={() => close(true)} className="sm:min-w-24">
              {pending?.confirmLabel}
            </Button>
          </div>
        }
      >
        <div className="text-sm leading-relaxed text-muted">{pending?.message}</div>
      </Sheet>
    </ToastCtx.Provider>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-surface px-5 py-10 text-center">
      <p className="text-base font-bold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function Loading({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <p role="status" className="py-12 text-center text-sm text-muted">
      {label}
    </p>
  );
}

export function ImagePicker({
  label,
  value,
  onPick,
  onClear,
  hint,
  checkered,
}: {
  label: string;
  value?: string;
  onPick: (f: File) => void;
  onClear: () => void;
  hint?: string;
  checkered?: boolean;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <div
        className={`grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-line ${checkered ? 'bg-[conic-gradient(#e5e5e5_25%,#fff_0_50%,#e5e5e5_0_75%,#fff_0)] bg-[length:12px_12px]' : 'bg-white'}`}
      >
        {value ? <img src={value} alt={label} className="max-h-full max-w-full object-contain" /> : <span className="px-1 text-center text-[11px] text-[#57534e]">Belum ada</span>}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        {hint && <p className="text-xs text-muted">{hint}</p>}
        <div className="mt-2 flex flex-wrap gap-2">
          <label htmlFor={id} className="inline-flex min-h-9 cursor-pointer items-center rounded-xl border border-line bg-surface px-3 text-sm font-semibold hover:bg-sunken focus-within:outline-2 focus-within:outline-[var(--focus)]">
            {value ? 'Ganti' : 'Pilih gambar'}
            <input
              id={id}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onPick(f);
                e.target.value = '';
              }}
            />
          </label>
          {value && (
            <Button size="sm" variant="ghost" onClick={onClear}>
              Hapus
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
