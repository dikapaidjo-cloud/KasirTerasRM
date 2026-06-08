import { Minus, Plus, Printer, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { api } from '../services/api.js';
import { usePosStore } from '../store/posStore.js';
import { formatMoney, sizeLabel } from '../utils/money.js';

export default function CartPanel({ onSaved }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const cartItems = usePosStore((state) => state.cartItems);
  const updateQty = usePosStore((state) => state.updateQty);
  const removeFromCart = usePosStore((state) => state.removeFromCart);
  const resetCart = usePosStore((state) => state.resetCart);
  const paymentMethod = usePosStore((state) => state.paymentMethod);
  const setPaymentMethod = usePosStore((state) => state.setPaymentMethod);
  const discountType = usePosStore((state) => state.discountType);
  const setDiscountType = usePosStore((state) => state.setDiscountType);
  const discountValue = usePosStore((state) => state.discountValue);
  const setDiscountValue = usePosStore((state) => state.setDiscountValue);
  const notes = usePosStore((state) => state.notes);
  const setNotes = usePosStore((state) => state.setNotes);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    const discount = discountType === 'percent'
      ? Math.min(Math.round((subtotal * discountValue) / 100), subtotal)
      : Math.min(discountValue, subtotal);
    return { subtotal, discount, total: Math.max(subtotal - discount, 0) };
  }, [cartItems, discountType, discountValue]);

  async function saveTransaction(printAfterSave = false) {
    if (!cartItems.length || saving) return;
    const receiptWindow = printAfterSave ? openReceiptWindow() : null;
    setSaving(true);
    setError('');
    try {
      const transaction = await api.transactions.create({
        items: cartItems,
        payment_method: paymentMethod,
        discount_type: discountType,
        discount_value: discountValue,
        notes
      });
      if (printAfterSave) printReceipt(transaction, receiptWindow);
      resetCart();
      onSaved?.();
    } catch (error) {
      receiptWindow?.close();
      setError(error.message || 'Transaksi gagal disimpan. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  function openReceiptWindow() {
    return window.open('', 'receipt', 'width=320,height=600');
  }

  function printReceipt(transaction, receiptWindow) {
    const text = buildReceipt(transaction);
    if ('bluetooth' in navigator) {
      alert('Struk siap. Hubungkan printer thermal via fitur Bluetooth browser jika perangkat mendukung.');
    }
    const win = receiptWindow || openReceiptWindow();
    if (win) {
      win.document.write(`
        <!doctype html>
        <html>
          <head>
            <title>Struk Teras RM</title>
            <style>
              body {
                margin: 0;
                padding: 14px;
                color: #24201d;
                font: 14px monospace;
              }
              .logo {
                display: block;
                width: 112px;
                height: 112px;
                object-fit: contain;
                margin: 0 auto 8px;
              }
              pre {
                margin: 0;
                white-space: pre-wrap;
              }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>
            <img class="logo" src="/logo.png" alt="Logo Teras RM" />
            <pre>${escapeHtml(text)}</pre>
          </body>
        </html>
      `);
      win.document.close();
      win.addEventListener('load', () => win.print(), { once: true });
    } else {
      setError('Transaksi tersimpan, tetapi jendela print diblokir browser.');
    }
  }

  return (
    <aside className="flex h-full flex-col rounded border border-crema bg-white">
      <div className="border-b border-crema px-4 py-3">
        <h2 className="text-lg font-bold text-coffee">Cart</h2>
      </div>
      <div className="min-h-[180px] flex-1 space-y-2 overflow-auto p-3">
        {cartItems.length === 0 && <p className="py-8 text-center text-sm text-stone-500">Keranjang kosong</p>}
        {cartItems.map((item) => (
          <div key={item.key} className="rounded border border-stone-200 p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-stone-500">{sizeLabel(item.size)} x {formatMoney(item.price)}</p>
              </div>
              <button className="grid h-9 w-9 place-items-center rounded text-red-700" onClick={() => removeFromCart(item.key)} title="Hapus">
                <Trash2 size={18} />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex items-center rounded border border-crema">
                <button className="grid h-10 w-10 place-items-center" onClick={() => updateQty(item.key, item.qty - 1)} title="Kurangi">
                  <Minus size={17} />
                </button>
                <span className="w-9 text-center font-bold">{item.qty}</span>
                <button className="grid h-10 w-10 place-items-center" onClick={() => updateQty(item.key, item.qty + 1)} title="Tambah">
                  <Plus size={17} />
                </button>
              </div>
              <strong>{formatMoney(item.total)}</strong>
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-3 border-t border-crema p-4">
        <div className="grid grid-cols-2 gap-2">
          <select className="touch-btn rounded border border-crema px-3" value={discountType} onChange={(event) => setDiscountType(event.target.value)}>
            <option value="nominal">Diskon Rp</option>
            <option value="percent">Diskon %</option>
          </select>
          <input className="touch-btn rounded border border-crema px-3" type="number" min="0" value={discountValue} onChange={(event) => setDiscountValue(event.target.value)} />
        </div>
        <textarea className="min-h-20 w-full rounded border border-crema px-3 py-2" placeholder="Catatan" value={notes} onChange={(event) => setNotes(event.target.value)} />
        <div className="grid grid-cols-2 gap-2">
          {['Cash', 'QRIS'].map((method) => (
            <button key={method} className={`touch-btn rounded border font-bold ${paymentMethod === method ? 'border-coffee bg-coffee text-white' : 'border-crema bg-paper text-coffee'}`} onClick={() => setPaymentMethod(method)}>
              {method}
            </button>
          ))}
        </div>
        <div className="space-y-1 text-sm">
          <Row label="Subtotal" value={totals.subtotal} />
          <Row label="Diskon" value={totals.discount} />
          <Row label="Total" value={totals.total} strong />
        </div>
        {error && (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {error}
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <button className="touch-btn rounded bg-leaf px-3 font-bold text-white disabled:opacity-50" disabled={!cartItems.length || saving} onClick={() => saveTransaction(false)}>
            Simpan
          </button>
          <button className="touch-btn flex items-center justify-center gap-2 rounded bg-coffee px-3 font-bold text-white disabled:opacity-50" disabled={!cartItems.length || saving} onClick={() => saveTransaction(true)}>
            <Printer size={18} /> Print
          </button>
        </div>
      </div>
    </aside>
  );
}

function Row({ label, value, strong = false }) {
  return (
    <div className={`flex justify-between ${strong ? 'text-lg font-bold text-coffee' : ''}`}>
      <span>{label}</span>
      <span>{formatMoney(value)}</span>
    </div>
  );
}

function buildReceipt(transaction) {
  const lines = [
    'TERAS RM',
    transaction.invoice_number,
    new Date(transaction.created_at).toLocaleString('id-ID'),
    '',
    ...transaction.items.flatMap((item) => [
      `${item.menu_name} ${sizeLabel(item.size)}`,
      `${item.qty} x ${formatMoney(item.price)}    ${formatMoney(item.total)}`
    ]),
    '',
    `Subtotal  ${formatMoney(transaction.subtotal)}`,
    `Diskon    ${formatMoney(transaction.discount_amount)}`,
    `Total     ${formatMoney(transaction.total)}`,
    transaction.payment_method,
    '',
    'Terima Kasih'
  ];
  return lines.join('\n');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
