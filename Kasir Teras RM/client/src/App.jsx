import { Coffee, FileDown, Settings } from 'lucide-react';
import CashierPage from './pages/CashierPage.jsx';
import ManagePage from './pages/ManagePage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import { usePosStore } from './store/posStore.js';

const tabs = [
  { id: 'cashier', label: 'Kasir', icon: Coffee },
  { id: 'manage', label: 'Menu', icon: Settings },
  { id: 'reports', label: 'Laporan', icon: FileDown }
];

export default function App() {
  const page = usePosStore((state) => state.page);
  const setPage = usePosStore((state) => state.setPage);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-crema bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <img className="h-14 w-14 rounded bg-white object-contain" src="/logo.png" alt="Logo Teras RM" />
            <div>
              <h1 className="text-xl font-bold leading-tight text-coffee">Teras RM</h1>
              <p className="text-sm text-stone-600">Kasir offline lokal</p>
            </div>
          </div>
          <nav className="flex rounded border border-crema bg-paper p-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`flex min-h-11 items-center gap-2 rounded px-3 text-sm font-semibold ${
                  page === id ? 'bg-coffee text-white' : 'text-coffee'
                }`}
                onClick={() => setPage(id)}
                title={label}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-4">
        {page === 'cashier' && <CashierPage />}
        {page === 'manage' && <ManagePage />}
        {page === 'reports' && <ReportsPage />}
      </main>
    </div>
  );
}
