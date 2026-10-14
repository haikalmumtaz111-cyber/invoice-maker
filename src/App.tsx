import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout';
import { useSettings } from './hooks';
import { requestPersistentStorage } from './db';
import { InvoiceList } from './pages/InvoiceList';
import { InvoiceEditor } from './pages/InvoiceEditor';
import { InvoiceView } from './pages/InvoiceView';
import { Clients } from './pages/Clients';
import { Templates } from './pages/Templates';
import { TemplateEditor } from './pages/TemplateEditor';
import { SettingsPage } from './pages/Settings';
import { Products } from './pages/Products';
import { Reports } from './pages/Reports';
import { EmptyState } from './components/ui';
import { Link } from 'react-router-dom';

export function App() {
  const settings = useSettings();

  useEffect(() => {
    const pref = settings?.theme;
    if (!pref) return;
    const root = document.documentElement;
    if (pref === 'system') delete root.dataset.theme;
    else root.dataset.theme = pref;
    try {
      localStorage.setItem('theme', pref);
    } catch {
      /* private mode */
    }
  }, [settings?.theme]);

  useEffect(() => {
    requestPersistentStorage().catch(() => undefined);
  }, []);

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<InvoiceList />} />
        <Route path="/invoice/:id" element={<InvoiceView />} />
        <Route path="/invoice/:id/edit" element={<InvoiceEditor />} />
        <Route path="/klien" element={<Clients />} />
        <Route path="/template" element={<Templates />} />
        <Route path="/template/:id" element={<TemplateEditor />} />
        <Route path="/pengaturan" element={<SettingsPage />} />
        <Route path="/produk" element={<Products />} />
        <Route path="/laporan" element={<Reports />} />
        <Route
          path="*"
          element={
            <EmptyState
              title="Halaman tidak ditemukan"
              body="Alamat ini tidak ada di aplikasi."
              action={
                <Link to="/" className="rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-bg">
                  Ke daftar invoice
                </Link>
              }
            />
          }
        />
      </Routes>
    </AppShell>
  );
}
