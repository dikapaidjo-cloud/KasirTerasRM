import { Download, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { formatMoney } from '../utils/money.js';

const today = new Date().toISOString().slice(0, 10);

export default function ReportsPage() {
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [daily, setDaily] = useState(null);
  const [transactions, setTransactions] = useState([]);

  async function loadData() {
    const [dailyRow, transactionRows] = await Promise.all([api.reports.daily(start), api.transactions.list()]);
    setDaily(dailyRow);
    setTransactions(transactionRows);
  }

  useEffect(() => {
    loadData();
  }, [start]);

  return (
    <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
      <section className="space-y-4">
        <div className="rounded border border-crema bg-white p-4">
          <h2 className="mb-3 text-lg font-bold text-coffee">Export Excel</h2>
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-stone-600">Mulai</label>
            <input className="touch-btn w-full rounded border border-crema px-3" type="date" value={start} onChange={(event) => setStart(event.target.value)} />
            <label className="block text-sm font-semibold text-stone-600">Sampai</label>
            <input className="touch-btn w-full rounded border border-crema px-3" type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
            <a className="touch-btn flex items-center justify-center gap-2 rounded bg-coffee px-3 font-bold text-white" href={api.reports.exportUrl(start, end)}>
              <Download size={18} /> Download
            </a>
          </div>
        </div>
        <div className="rounded border border-crema bg-white p-4">
          <h2 className="mb-3 text-lg font-bold text-coffee">Ringkasan Hari Ini</h2>
          <div className="space-y-2">
            <Row label="Transaksi" value={daily?.transactions || 0} raw />
            <Row label="Subtotal" value={daily?.subtotal || 0} />
            <Row label="Diskon" value={daily?.discount || 0} />
            <Row label="Total" value={daily?.total || 0} strong />
          </div>
        </div>
      </section>
      <section className="rounded border border-crema bg-white">
        <div className="border-b border-crema px-4 py-3">
          <h2 className="text-lg font-bold text-coffee">Transaksi Terakhir</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[740px] text-left text-sm">
            <thead className="bg-paper text-coffee">
              <tr>
                <th className="p-3">Invoice</th>
                <th className="p-3">Waktu</th>
                <th className="p-3">Item</th>
                <th className="p-3">Pembayaran</th>
                <th className="p-3">Total</th>
                <th className="p-3">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-stone-100">
                  <td className="p-3 font-semibold">{transaction.invoice_number}</td>
                  <td className="p-3">{new Date(transaction.created_at).toLocaleString('id-ID')}</td>
                  <td className="p-3">{transaction.items.map((item) => `${item.menu_name} x${item.qty}`).join(', ')}</td>
                  <td className="p-3">{transaction.payment_method}</td>
                  <td className="p-3 font-bold">{formatMoney(transaction.total)}</td>
                  <td className="p-3">
                    <button className="grid h-10 w-10 place-items-center rounded bg-red-50 text-red-700" onClick={async () => { await api.transactions.delete(transaction.id); loadData(); }} title="Hapus transaksi">
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, raw = false, strong = false }) {
  return (
    <div className={`flex justify-between ${strong ? 'text-lg font-bold text-coffee' : ''}`}>
      <span>{label}</span>
      <span>{raw ? value : formatMoney(value)}</span>
    </div>
  );
}
