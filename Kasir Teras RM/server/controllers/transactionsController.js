import { db } from '../database/db.js';

export function listTransactions(req, res) {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  const rows = db.prepare(`
    SELECT *
    FROM transactions
    ORDER BY datetime(created_at) DESC, id DESC
    LIMIT ?
  `).all(limit);

  const itemsByTransaction = getItemsByTransaction(rows.map((row) => row.id));
  res.json(rows.map((row) => ({ ...row, items: itemsByTransaction[row.id] || [] })));
}

export function createTransaction(req, res) {
  const items = Array.isArray(req.body.items) ? req.body.items : [];
  if (!items.length) return res.status(400).json({ message: 'Keranjang masih kosong' });

  const paymentMethod = req.body.payment_method === 'QRIS' ? 'QRIS' : 'Cash';
  const discountType = req.body.discount_type === 'percent' ? 'percent' : 'nominal';
  const discountValue = Math.max(Number(req.body.discount_value) || 0, 0);
  const subtotal = items.reduce((sum, item) => sum + Number(item.total || item.qty * item.price || 0), 0);
  const discountAmount = discountType === 'percent'
    ? Math.min(Math.round((subtotal * discountValue) / 100), subtotal)
    : Math.min(discountValue, subtotal);
  const total = Math.max(subtotal - discountAmount, 0);

  try {
    const insert = db.transaction(() => {
      const invoice = createInvoiceNumber();
      const transaction = db.prepare(`
        INSERT INTO transactions (
          invoice_number, payment_method, subtotal, discount_type,
          discount_value, discount_amount, total, notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(invoice, paymentMethod, subtotal, discountType, discountValue, discountAmount, total, req.body.notes || '');

      const insertItem = db.prepare(`
        INSERT INTO transaction_items (transaction_id, menu_id, menu_name, size, qty, price, total)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      items.forEach((item) => {
        const qty = Math.max(Number(item.qty) || 1, 1);
        const price = Math.max(Number(item.price) || 0, 0);
        insertItem.run(
          transaction.lastInsertRowid,
          item.menu_id || item.id || null,
          item.menu_name || item.name,
          item.size || 'regular',
          qty,
          price,
          qty * price
        );
      });

      return getTransaction(transaction.lastInsertRowid);
    });

    res.status(201).json(insert());
  } catch (error) {
    console.error('Failed to create transaction', error);
    res.status(500).json({ message: 'Transaksi gagal disimpan. Silakan coba lagi.' });
  }
}

export function deleteTransaction(req, res) {
  db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
  res.status(204).end();
}

function createInvoiceNumber() {
  const date = new Date();
  const stamp = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('');
  const latest = db.prepare(`
    SELECT invoice_number
    FROM transactions
    WHERE invoice_number LIKE ?
    ORDER BY invoice_number DESC
    LIMIT 1
  `).get(`TRM-${stamp}-%`);
  const sequence = latest?.invoice_number
    ? Number(latest.invoice_number.split('-').at(-1)) + 1
    : 1;
  return `TRM-${stamp}-${String(sequence).padStart(4, '0')}`;
}

function getTransaction(id) {
  const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  return { ...transaction, items: getItemsByTransaction([id])[id] || [] };
}

function getItemsByTransaction(ids) {
  if (!ids.length) return {};
  const placeholders = ids.map(() => '?').join(',');
  const items = db.prepare(`
    SELECT *
    FROM transaction_items
    WHERE transaction_id IN (${placeholders})
    ORDER BY id
  `).all(...ids);
  return items.reduce((grouped, item) => {
    grouped[item.transaction_id] = grouped[item.transaction_id] || [];
    grouped[item.transaction_id].push(item);
    return grouped;
  }, {});
}
